"""add content column to posts table

Revision ID: bfd2b3b4ba5e
Revises: f327ca6a5ecb
Create Date: 2026-02-05 16:59:07.871864

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bfd2b3b4ba5e'
down_revision: Union[str, Sequence[str], None] = 'f327ca6a5ecb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('content', sa.String(), nullable=False))
    pass


def downgrade() -> None:
    op.drop_column('posts','content')
    pass
