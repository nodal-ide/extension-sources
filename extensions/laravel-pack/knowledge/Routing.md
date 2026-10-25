# Routing

Laravel's routing lives in `routes/web.php`.

```php
Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
```

## Named routes

Generate a URL for a named route with the global `route()` helper:

```php
$url = route('users.show', ['id' => 1]);
```

> The `route()` helper is provided by this pack's symbols, so it completes and documents inline.
