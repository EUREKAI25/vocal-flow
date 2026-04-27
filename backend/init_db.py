#!/usr/bin/env python3
"""
Initialise la DB et crée un utilisateur.
Usage:
    python3 init_db.py
    python3 init_db.py --username nathalie --password monmotdepasse
"""
import argparse
import getpass
from database import init_db, get_conn
from auth import hash_password, get_user_by_username


def create_user(username: str, password: str):
    existing = get_user_by_username(username)
    if existing:
        print(f"L'utilisateur '{username}' existe déjà.")
        return
    hashed = hash_password(password)
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, hashed),
        )
    print(f"Utilisateur '{username}' créé.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--username", default=None)
    parser.add_argument("--password", default=None)
    args = parser.parse_args()

    init_db()
    print("DB initialisée.")

    username = args.username or input("Username : ")
    password = args.password or getpass.getpass("Password : ")
    create_user(username, password)
