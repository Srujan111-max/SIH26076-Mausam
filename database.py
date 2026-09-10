import sqlite3


DATABASE = "mausam.db"


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def init_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            role TEXT NOT NULL,
            destination TEXT
        )
    """)

    connection.commit()
    connection.close()


def save_user(location, role, destination=None):
    connection = get_connection()

    cursor = connection.execute("""
        INSERT INTO users (location, role, destination)
        VALUES (?, ?, ?)
    """, (location, role, destination))

    connection.commit()

    user_id = cursor.lastrowid

    connection.close()

    return user_id


def get_user(user_id):
    connection = get_connection()

    user = connection.execute("""
        SELECT id, location, role, destination
        FROM users
        WHERE id = ?
    """, (user_id,)).fetchone()

    connection.close()

    if user is None:
        return None

    return dict(user)


if __name__ == "__main__":
    init_database()

    user_id = save_user(
        "Davangere",
        "runner"
    )

    print("User saved with ID:", user_id)

    user = get_user(user_id)

    print("User data:")
    print(user)