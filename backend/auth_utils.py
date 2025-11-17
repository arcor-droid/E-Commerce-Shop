"""
Authentication utilities for password hashing and verification.
"""
import bcrypt


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
        
    Note:
        Bcrypt has a 72-byte password limit. Passwords are truncated if longer.
    """
    # Truncate password to 72 bytes (bcrypt limit)
    password_bytes = password.encode('utf-8')[:72]
    
    # Generate salt and hash the password
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Return as string (bcrypt returns bytes)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    # Truncate password to 72 bytes (bcrypt limit)
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    
    return bcrypt.checkpw(password_bytes, hashed_bytes)

