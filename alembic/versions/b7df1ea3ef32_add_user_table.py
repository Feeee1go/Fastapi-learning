"""add user table

Revision ID: b7df1ea3ef32
Revises: bfd2b3b4ba5e
Create Date: 2026-02-05 17:06:03.661709

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7df1ea3ef32'
down_revision: Union[str, Sequence[str], None] = 'bfd2b3b4ba5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('users',
                    sa.Column('id', sa.Integer(), nullable=False),
                    sa.Column('email', sa.String(), nullable=False),
                    sa.Column('password', sa.String(), nullable=False),
                    sa.Column('created_at', sa.TIMESTAMP(timezone=True),
                              server_default=sa.text('now()'), nullable=False),
                    sa.PrimaryKeyConstraint('id'),
                    sa.UniqueConstraint('email')
                              )
    pass


def downgrade() -> None:
    op.drop_table('users')
    pass
