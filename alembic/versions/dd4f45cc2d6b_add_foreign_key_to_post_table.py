"""add foreign key to post table

Revision ID: dd4f45cc2d6b
Revises: b7df1ea3ef32
Create Date: 2026-02-11 09:15:52.216544

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dd4f45cc2d6b'
down_revision: Union[str, Sequence[str], None] = 'b7df1ea3ef32'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts',sa.Column('owner_id', sa.Integer(), nullable=False))
    op.create_foreign_key('post_users_fk', source_table = "posts", referent_table="users",local_cols=['owner_id'], remote_cols=['id'], ondelete="CASCADE")
    pass


def downgrade() -> None:
    op.drop_constrains('post_users_fk', table_name="posts")
    op.drop_column('posts','owner_id')
    pass
