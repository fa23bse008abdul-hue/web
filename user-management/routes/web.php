<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserRegistrationController;


Route::get('/', function () {
    return view('welcome');
});
Route::get('/', [UserRegistrationController::class, 'index']);
Route::get('/create', [UserRegistrationController::class, 'create']);
Route::post('/store', [UserRegistrationController::class, 'store']);
Route::get('/edit/{id}', [UserRegistrationController::class, 'edit']);
Route::post('/update/{id}', [UserRegistrationController::class, 'update']);
Route::get('/delete/{id}', [UserRegistrationController::class, 'destroy']);
Route::get('/search', [UserRegistrationController::class, 'search']);