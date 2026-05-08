<?php

namespace App\Http\Requests\Projects;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectCoverRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('project'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|string>>
     */
    public function rules(): array
    {
        return [
            'cover_asset_id' => [
                'nullable',
                'integer',
                Rule::exists('project_assets', 'id')
                    ->where('project_id', $this->route('project')->id),
            ],
        ];
    }
}
