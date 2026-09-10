from database import get_connection

connection = get_connection()

users = connection.execute("""
    SELECT * FROM users
""").fetchall()

connection.close()

for user in users:
    print(dict(user))