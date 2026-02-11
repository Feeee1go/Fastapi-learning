from jose import JWTError, jwt
from datetime import datetime, timedelta
from . import schemas, models, database
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl = 'login')

# SECRET_KEY
# Algorithm
# 持续时间

# 1. 密钥：文档通常建议使用 openssl rand -hex 32 生成
# 这里使用文档示例中的占位密钥
SECRET_KEY = settings.secret_key

# 2. 算法：HS256 是最常用的对称加密算法
ALGORITHM = settings.algorithm

# 3. 过期时间：通常设置为 30 分钟
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

def create_access_token(data: dict):
    to_encode = data.copy()
    
    # 设置过期时间
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # 使用 python-jose 进行编码
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def verify_access_token(token:str, credentials_exception):
    
    try:
      payload = jwt.decode(token,SECRET_KEY, algorithms = [ALGORITHM])

      id:str = payload.get("user_id")

      if id is None:
        raise credentials_exception
      token_data = schemas.TokenData(id=str(id))
    
    except JWTError:
       raise credentials_exception
    
    return token_data
    
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
   credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = f"could not validate credentials", headers={"WWW-Authenticate":"Bearer"})

   token = verify_access_token(token, credentials_exception)

   user = db.query(models.User).filter(models.User.id == token.id).first()
   
   return user