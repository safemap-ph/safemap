from cryptography.fernet import Fernet

# Generate a proper Fernet key
key = Fernet.generate_key()
print(f"Generated Fernet Key: {key.decode()}")
print(f"\nAdd this to your .env file or config.py:")
print(f"ENCRYPTION_KEY={key.decode()}")
