from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base


class Table(Base):
    __tablename__ = "tables"
    __table_args__ = (
        UniqueConstraint("store_id", "table_number", name="uq_table_store_number"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    store_id: Mapped[int] = mapped_column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    table_number: Mapped[int] = mapped_column(Integer, nullable=False)
    password: Mapped[str] = mapped_column(String(50), nullable=False)
    session_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    session_started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    store = relationship("Store", back_populates="tables")
    orders = relationship("Order", back_populates="table", cascade="all, delete-orphan")
