import socket
import time
import sys
import os
from urllib.parse import urlparse

def wait_for_mysql(
    host: str = '127.0.0.1',
    port: int = 3306,
    timeout_seconds: int = 60,
    interval_seconds: int = 1
) -> None:
    """
    Attempts to establish a socket connection to a MySQL server at the specified
    host and port within a given timeout.

    Args:
        host: The host or IP address of the MySQL server.
        port: The port of the MySQL server.
        timeout_seconds: The timeout in seconds.
        interval_seconds: The interval in seconds to check if MySQL is ready.

    Raises:
        Exception: If the timeout is reached before a connection can be established,
        or if an unexpected socket error occurs repeatedly.
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM) # AF_INET for IPv4, SOCK_STREAM for TCP
    start_time = time.time()

    print(f"Waiting for MySQL at {host}:{port}...", flush=True)

    while True:
        try:
            # Attempt to connect to the MySQL server
            s.connect((host, port))
            s.close() # Close the socket immediately after successful connection
            print("MySQL is ready! Connection established.", flush=True)
            return # Exit the function on success
        except (socket.timeout, ConnectionRefusedError) as ex:
            # Handle specific connection errors: timeout or connection refused
            elapsed_time = time.time() - start_time
            if elapsed_time >= timeout_seconds:
                # If timeout is reached, print error and raise exception
                print(f"Timeout ({timeout_seconds}s) waiting for MySQL connection.", file=sys.stderr, flush=True)
                raise Exception(f"MySQL connection timed out after {timeout_seconds}s: {ex}")
            # Print current status and wait before retrying
            print(f"Waiting for MySQL at {host}:{port}... {ex} (Elapsed: {elapsed_time:.1f}s)", flush=True)
            time.sleep(interval_seconds)
        except Exception as ex:
            # Catch any other unexpected errors during connection attempts
            elapsed_time = time.time() - start_time
            if elapsed_time >= timeout_seconds:
                # If timeout is reached, print error and raise exception
                print(f"Timeout ({timeout_seconds}s) waiting for MySQL connection due to unexpected error: {ex}", file=sys.stderr, flush=True)
                raise Exception(f"MySQL connection timed out after {timeout_seconds}s due to unexpected error: {ex}")
            print(f"An unexpected error occurred during connection: {ex}. Retrying... (Elapsed: {elapsed_time:.1f}s)", file=sys.stderr, flush=True)
            time.sleep(interval_seconds)

def main():
    """
    Main entry point for the wait_for_mysql script.
    It determines the MySQL host and port, prioritizing the DATABASE_URL environment variable,
    then falls back to default parameters for wait_for_mysql.
    """
    db_host = '127.0.0.1'
    db_port = 3306

    database_url = os.getenv('DATABASE_URL')
    
    if database_url:
        try:
            # Parse the DATABASE_URL to extract host and port
            db_parts = urlparse(database_url)
            # Ensure hostname is not None
            if db_parts.hostname:
                db_host = db_parts.hostname
            # Ensure port is not None
            if db_parts.port:
                db_port = db_parts.port
            print(f"Using DATABASE_URL from environment: {db_host}:{db_port}", flush=True)
        except Exception as e:
            print(f"Warning: Could not parse DATABASE_URL from environment ({database_url}). Error: {e}", file=sys.stderr, flush=True)
            print(f"Falling back to default host: ({db_host}) and port: ({db_port})", file=sys.stderr, flush=True)
    else:
        print(f"DATABASE_URL environment variable not found. Using default host: ({db_host}) and port: ({db_port})", flush=True)
    
    try:
        # Call the wait_for_mysql function with the determined host and port
        wait_for_mysql(host=db_host, port=db_port)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr, flush=True)
        sys.exit(1) # Exit with non-zero code to indicate failure

if __name__ == "__main__":
    main()