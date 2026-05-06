<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
