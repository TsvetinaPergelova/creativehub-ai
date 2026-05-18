<?php

namespace App\Http\Controllers\Projects;

use App\Actions\Ai\GenerateProjectBriefAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Projects\GenerateProjectBriefRequest;
use Illuminate\Http\JsonResponse;

class ProjectBriefAssistantController extends Controller
{
    public function store(
        GenerateProjectBriefRequest $request,
        GenerateProjectBriefAction $generateProjectBrief,
    ): JsonResponse {
        return response()->json([
            'suggestion' => $generateProjectBrief->handle($request->validated()),
        ]);
    }
}
