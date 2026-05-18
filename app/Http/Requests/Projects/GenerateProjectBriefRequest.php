<?php

namespace App\Http\Requests\Projects;

use App\Enums\ProjectMode;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateProjectBriefRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:120'],
            'mode' => ['required', Rule::enum(ProjectMode::class)],
            'description' => ['nullable', 'string', 'max:5000'],
            'project_intent' => ['nullable', 'string', 'max:160'],
            'target_audience' => ['nullable', 'string', 'max:160'],
            'creative_direction' => ['nullable', 'string', 'max:160'],
        ];
    }
}
