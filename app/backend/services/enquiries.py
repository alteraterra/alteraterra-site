import logging
from typing import Optional, Dict, Any, List

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.enquiries import Enquiries

logger = logging.getLogger(__name__)


# ------------------ Service Layer ------------------
class EnquiriesService:
    """Service layer for Enquiries operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: Dict[str, Any]) -> Optional[Enquiries]:
        """Create a new enquiries"""
        try:
            obj = Enquiries(**data)
            self.db.add(obj)
            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Created enquiries with id: {obj.id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating enquiries: {str(e)}")
            raise

    async def get_by_id(self, obj_id: int) -> Optional[Enquiries]:
        """Get enquiries by ID"""
        try:
            query = select(Enquiries).where(Enquiries.id == obj_id)
            result = await self.db.execute(query)
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching enquiries {obj_id}: {str(e)}")
            raise

    async def get_list(
        self, 
        skip: int = 0, 
        limit: int = 20, 
        query_dict: Optional[Dict[str, Any]] = None,
        sort: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get paginated list of enquiriess"""
        try:
            query = select(Enquiries)
            count_query = select(func.count(Enquiries.id))
            
            if query_dict:
                for field, value in query_dict.items():
                    if hasattr(Enquiries, field):
                        query = query.where(getattr(Enquiries, field) == value)
                        count_query = count_query.where(getattr(Enquiries, field) == value)
            
            count_result = await self.db.execute(count_query)
            total = count_result.scalar()

            if sort:
                if sort.startswith('-'):
                    field_name = sort[1:]
                    if hasattr(Enquiries, field_name):
                        query = query.order_by(getattr(Enquiries, field_name).desc())
                else:
                    if hasattr(Enquiries, sort):
                        query = query.order_by(getattr(Enquiries, sort))
            else:
                query = query.order_by(Enquiries.id.desc())

            result = await self.db.execute(query.offset(skip).limit(limit))
            items = result.scalars().all()

            return {
                "items": items,
                "total": total,
                "skip": skip,
                "limit": limit,
            }
        except Exception as e:
            logger.error(f"Error fetching enquiries list: {str(e)}")
            raise

    async def update(self, obj_id: int, update_data: Dict[str, Any]) -> Optional[Enquiries]:
        """Update enquiries"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Enquiries {obj_id} not found for update")
                return None
            for key, value in update_data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)

            await self.db.commit()
            await self.db.refresh(obj)
            logger.info(f"Updated enquiries {obj_id}")
            return obj
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error updating enquiries {obj_id}: {str(e)}")
            raise

    async def delete(self, obj_id: int) -> bool:
        """Delete enquiries"""
        try:
            obj = await self.get_by_id(obj_id)
            if not obj:
                logger.warning(f"Enquiries {obj_id} not found for deletion")
                return False
            await self.db.delete(obj)
            await self.db.commit()
            logger.info(f"Deleted enquiries {obj_id}")
            return True
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error deleting enquiries {obj_id}: {str(e)}")
            raise

    async def get_by_field(self, field_name: str, field_value: Any) -> Optional[Enquiries]:
        """Get enquiries by any field"""
        try:
            if not hasattr(Enquiries, field_name):
                raise ValueError(f"Field {field_name} does not exist on Enquiries")
            result = await self.db.execute(
                select(Enquiries).where(getattr(Enquiries, field_name) == field_value)
            )
            return result.scalar_one_or_none()
        except Exception as e:
            logger.error(f"Error fetching enquiries by {field_name}: {str(e)}")
            raise

    async def list_by_field(
        self, field_name: str, field_value: Any, skip: int = 0, limit: int = 20
    ) -> List[Enquiries]:
        """Get list of enquiriess filtered by field"""
        try:
            if not hasattr(Enquiries, field_name):
                raise ValueError(f"Field {field_name} does not exist on Enquiries")
            result = await self.db.execute(
                select(Enquiries)
                .where(getattr(Enquiries, field_name) == field_value)
                .offset(skip)
                .limit(limit)
                .order_by(Enquiries.id.desc())
            )
            return result.scalars().all()
        except Exception as e:
            logger.error(f"Error fetching enquiriess by {field_name}: {str(e)}")
            raise