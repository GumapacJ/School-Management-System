
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StudentController;
Route::apiResource('students', StudentController::class);

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});