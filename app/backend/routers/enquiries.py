import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.enquiries import EnquiriesService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/enquiries", tags=["enquiries"])


# ---------- Pydantic Schemas ----------
class EnquiriesData(BaseModel):
    """Entity data schema (for create/update)"""
    full_name: str
    email: str
    phone: str = None
    area_of_interest: str
    message: str
    created_at: Optional[datetime] = None


class EnquiriesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    area_of_interest: Optional[str] = None
    message: Optional[str] = None
    created_at: Optional[datetime] = None


class EnquiriesResponse(BaseModel):
    """Entity response schema"""
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    area_of_interest: str
    message: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EnquiriesListResponse(BaseModel):
    """List response schema"""
    items: List[EnquiriesResponse]
    total: int
    skip: int
    limit: int


class EnquiriesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[EnquiriesData]


class EnquiriesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: EnquiriesUpdateData


class EnquiriesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[EnquiriesBatchUpdateItem]


class EnquiriesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=EnquiriesListResponse)
async def query_enquiriess(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query enquiriess with filtering, sorting, and pagination"""
    logger.debug(f"Querying enquiriess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = EnquiriesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
        )
        logger.debug(f"Found {result['total']} enquiriess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying enquiriess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=EnquiriesListResponse)
async def query_enquiriess_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query enquiriess with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying enquiriess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = EnquiriesService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} enquiriess")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying enquiriess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=EnquiriesResponse)
async def get_enquiries(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single enquiries by ID"""
    logger.debug(f"Fetching enquiries with id: {id}, fields={fields}")
    
    service = EnquiriesService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Enquiries with id {id} not found")
            raise HTTPException(status_code=404, detail="Enquiries not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching enquiries {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=EnquiriesResponse, status_code=201)
async def create_enquiries(
    data: EnquiriesData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new enquiries"""
    logger.debug(f"Creating new enquiries with data: {data}")
    
    service = EnquiriesService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create enquiries")
        
        logger.info(f"Enquiries created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating enquiries: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating enquiries: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[EnquiriesResponse], status_code=201)
async def create_enquiriess_batch(
    request: EnquiriesBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple enquiriess in a single request"""
    logger.debug(f"Batch creating {len(request.items)} enquiriess")
    
    service = EnquiriesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} enquiriess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[EnquiriesResponse])
async def update_enquiriess_batch(
    request: EnquiriesBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple enquiriess in a single request"""
    logger.debug(f"Batch updating {len(request.items)} enquiriess")
    
    service = EnquiriesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} enquiriess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=EnquiriesResponse)
async def update_enquiries(
    id: int,
    data: EnquiriesUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing enquiries"""
    logger.debug(f"Updating enquiries {id} with data: {data}")

    service = EnquiriesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"Enquiries with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Enquiries not found")
        
        logger.info(f"Enquiries {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating enquiries {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating enquiries {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_enquiriess_batch(
    request: EnquiriesBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple enquiriess by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} enquiriess")
    
    service = EnquiriesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} enquiriess successfully")
        return {"message": f"Successfully deleted {deleted_count} enquiriess", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_enquiries(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single enquiries by ID"""
    logger.debug(f"Deleting enquiries with id: {id}")
    
    service = EnquiriesService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"Enquiries with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Enquiries not found")
        
        logger.info(f"Enquiries {id} deleted successfully")
        return {"message": "Enquiries deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting enquiries {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")