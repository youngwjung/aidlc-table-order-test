from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base


class OrderHistory(Base):
    __tablename__ = "order_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    store_id: Mapped[int] = mapped_column(Integer, ForeignKey("stores.id"), nullable=False, index=True)
    table_id: Mapped[int] = mapped_column(Integer, nullable=False)
    table_number: Mapped[int] = mapped_column(Integer, nullable=False)
    session_id: Mapped[str] = mapped_column(String(36), nullable=False)
    order_number: Mapped[str] = mapped_column(String(10), nullable=False)
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    ordered_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)

    items = relationship("OrderHistoryItem", back_populates="order_history", cascade="all, delete-orphan")


class OrderHistoryItem(Base):
    __tablename__ = "order_history_items"
    __table_args__ = (
        CheckConstraint("quantity >= 1", name="ck_ohitem_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="ck_ohitem_price_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_history_id: Mapped[int] = mapped_column(Integer, ForeignKey("order_history.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_name: Mapped[str] = mapped_column(String(100), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[int] = mapped_column(Integer, nullable=False)

    order_history = relationship("OrderHistory", back_populates="items")
