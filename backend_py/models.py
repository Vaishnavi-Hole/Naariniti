"""
SQLAlchemy relational database models for Nariniti.
Enforces foreign keys, indexing, and user ownership isolation.
"""
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Float,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    Enum,
)
from sqlalchemy.orm import relationship
from backend_py.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    full_name = Column(String(128), nullable=False)
    email_or_phone = Column(String(128), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    salt = Column(String(64), nullable=False)
    role = Column(String(32), default="entrepreneur", nullable=False) # entrepreneur, admin, partner
    state = Column(String(64), default="Maharashtra")
    district = Column(String(64), default="Pune")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("UserDocument", back_populates="user", cascade="all, delete-orphan")
    action_plans = relationship("ActionPlan", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "entrepreneur_profiles"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    preferred_name = Column(String(128))
    age_band = Column(String(32), default="26-35")
    village_town = Column(String(128))
    language = Column(String(16), default="mr") # mr, hi, en
    interaction_mode = Column(String(32), default="both") # text, voice, both
    education_level = Column(String(64), default="secondary")
    existing_occupation = Column(String(128))
    previous_business_experience = Column(Boolean, default=False)
    business_sector = Column(String(64), default="food_snacks")
    business_stage = Column(String(32), default="planning")
    available_investment = Column(Float, default=30000.0)
    monthly_income_band = Column(String(64))
    has_smartphone = Column(Boolean, default=True)
    has_internet = Column(Boolean, default=True)
    has_workspace = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Project(Base):
    __tablename__ = "business_projects"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(256), nullable=False)
    sector = Column(String(64), nullable=False)
    idea_description = Column(Text)
    budget_in_inr = Column(Float, default=30000.0)
    target_daily_customers = Column(Integer, default=50)
    operation_mode = Column(String(32), default="stall") # stall, home, rented_shop, mobile_cart
    stage = Column(String(32), default="planning")
    location = Column(String(256))
    has_equipment = Column(Boolean, default=False)
    equipment_notes = Column(Text)
    plan_completion_percentage = Column(Integer, default=20)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="projects")


class UserDocument(Base):
    __tablename__ = "user_documents"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(256), nullable=False)
    purpose = Column(Text)
    is_mandatory = Column(Boolean, default=True)
    status = Column(String(32), default="needed") # available, needed, in_progress
    how_to_obtain = Column(Text)
    issuing_authority = Column(String(256))
    official_reference_url = Column(String(512))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="documents")


class ActionPlan(Base):
    __tablename__ = "action_plans"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(String(64), ForeignKey("business_projects.id", ondelete="CASCADE"), nullable=True)
    phase = Column(String(32), nullable=False) # days_1_7, days_8_14, days_15_21, days_22_30
    title = Column(String(256), nullable=False)
    description = Column(Text)
    estimated_days = Column(Integer, default=1)
    estimated_cost_inr = Column(Float, default=0.0)
    materials_needed = Column(JSON, default=list)
    is_completed = Column(Boolean, default=False)
    related_scheme_id = Column(String(64))
    status = Column(String(32), default="pending")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="action_plans")


class Feedback(Base):
    __tablename__ = "user_feedbacks"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_id = Column(String(64), nullable=False)
    feedback_type = Column(String(64), nullable=False)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
