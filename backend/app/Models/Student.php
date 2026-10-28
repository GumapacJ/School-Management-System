<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'student_number',
        'first_name',
        'middle_name',
        'last_name',
        'photo_path',
        'sex',
        'strand',
        'section',
        'email',
        'phone',
        'grade_level',
        'status',
    ];
}