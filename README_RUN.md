# How to Run (PHP & MySQL Version)

Since the app now uses a backend, you cannot just open `index.html` in your browser. You need a local server.

### 1. Requirements
*   **XAMPP** (or WAMP/Laragon)
*   **MySQL** (MariaDB)

### 2. Setup Database (You already did this)
*   Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
*   Create a database: `shop_master`.
*   Import `database/schema.sql`.

### 3. Move Project to Web Root
*   Copy your entire `Shop M` folder.
*   Paste it into `C:\xampp\htdocs\`.
*   The final path should be `C:\xampp\htdocs\Shop M\`.

### 4. Start Servers
*   Open the **XAMPP Control Panel**.
*   Click **Start** for **Apache**.
*   Click **Start** for **MySQL**.

### 5. Access the App
*   Open your browser and go to:
    `http://localhost/Shop M/login.html`

### 6. Login
*   **Username**: `asma`
*   **Password**: `asma`

---
**Note**: If you chose a different database password during XAMPP setup, update it in `api/db.php`:
```php
$password = 'YOUR_PASSWORD';
```
