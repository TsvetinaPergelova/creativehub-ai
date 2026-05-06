# CreativeHub AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Да изградим MVP на CreativeHub AI като платформа за творци и фотографи с проекти, качване на снимки, AI анализ, публично портфолио и клиентски галерии.

**Architecture:** Започваме от съществуващия Laravel 13 + Inertia React skeleton и добавяме вертикални slices: домейн модели, CRUD и upload flow, AI pipeline, project manager, public/client presentation. Планът е разделен на независими delivery phases, така че всяка фаза да оставя работещ, тестван и демонстрируем резултат.

**Tech Stack:** Laravel 13, PHP 8.5, Inertia v3, React 19, Tailwind v4, Laravel Fortify, Laravel AI, Laravel Wayfinder, Pest 4, PostgreSQL, queues/jobs, filesystem storage.

---

## Implementation Status

- [x] Task 1: Domain Foundation and Project Schema
- [x] Task 2: Project CRUD and Dashboard Integration
- [x] Task 3: Asset Upload Pipeline and Project Manager Shell
- [x] Task 4: AI Analysis MVP for Tags, Alt Text, Critique, and Highlights
- [x] Task 5: AI Sidebar and Curator Presence in Project Manager
- [x] Task 6: Publishing, Public Profile, and Public Project Pages
- [x] Task 7: Client Gallery with Password Access and Favorites
- [x] Task 8: Explore Feed and Portfolio Intelligence Widgets
- [x] Task 9: Polish, Authorization, Seed Data, and Regression Coverage

## AI Provider Decision

- MVP AI is `Gemini-only` through the Laravel AI SDK.
- Use `GEMINI_API_KEY` as the runtime credential.
- Default text, image, and embeddings flows should point to Gemini.
- TTS, STT, and reranking stay out of MVP scope until there is a clear product need, since Gemini is not our active path for those capabilities here.

---

## Scope Note

Текущата спецификация покрива няколко подсистеми: вътрешен project manager, AI анализатор, публично портфолио, клиентска галерия и community explore. Вместо да се изпълняват едновременно, този master plan ги подрежда в фази. Препоръчаният ред е:

1. Foundation + Projects
2. Upload + Media Library
3. AI Analysis MVP
4. Project Manager UX
5. Public Profile + Public Projects
6. Client Gallery + Favorites
7. Explore + Portfolio Intelligence

## File Structure Map

### Existing files that will be extended

- Modify: `routes/web.php`
- Modify: `resources/js/pages/dashboard.tsx`
- Modify: `resources/js/layouts/app-layout.tsx`
- Modify: `app/Http/Middleware/HandleInertiaRequests.php`
- Modify: `config/ai.php`
- Modify: `database/seeders/DatabaseSeeder.php`

### Domain files to add

- Create: `app/Models/Project.php`
- Create: `app/Models/ProjectAsset.php`
- Create: `app/Models/ProjectAssetAnalysis.php`
- Create: `app/Models/ProjectShare.php`
- Create: `app/Models/ClientSelection.php`
- Create: `app/Enums/ProjectVisibility.php`
- Create: `app/Enums/ProjectStatus.php`
- Create: `app/Enums/ProjectAssetMood.php`

### HTTP layer files to add

- Create: `app/Http/Controllers/Projects/ProjectController.php`
- Create: `app/Http/Controllers/Projects/ProjectAssetController.php`
- Create: `app/Http/Controllers/Projects/ProjectPublishController.php`
- Create: `app/Http/Controllers/PublicProfileController.php`
- Create: `app/Http/Controllers/PublicProjectController.php`
- Create: `app/Http/Controllers/ClientGalleryController.php`
- Create: `app/Http/Requests/Projects/StoreProjectRequest.php`
- Create: `app/Http/Requests/Projects/UpdateProjectRequest.php`
- Create: `app/Http/Requests/Projects/StoreProjectAssetRequest.php`
- Create: `app/Http/Requests/Projects/PublishProjectRequest.php`
- Create: `app/Http/Requests/Client/ToggleFavoriteRequest.php`

### AI and domain service files to add

- Create: `app/Actions/Projects/CreateProjectAction.php`
- Create: `app/Actions/Projects/UploadProjectAssetsAction.php`
- Create: `app/Actions/Projects/GenerateProjectShareAction.php`
- Create: `app/Actions/Ai/AnalyzeProjectAssetAction.php`
- Create: `app/Actions/Ai/GenerateProjectHighlightsAction.php`
- Create: `app/Jobs/Ai/AnalyzeProjectAssetJob.php`
- Create: `app/Jobs/Ai/RefreshProjectHighlightsJob.php`
- Create: `app/Support/Ai/ProjectAssetAnalysisData.php`

### Frontend files to add

- Create: `resources/js/pages/projects/index.tsx`
- Create: `resources/js/pages/projects/create.tsx`
- Create: `resources/js/pages/projects/show.tsx`
- Create: `resources/js/pages/projects/client.tsx`
- Create: `resources/js/pages/public/profile.tsx`
- Create: `resources/js/pages/public/project.tsx`
- Create: `resources/js/components/projects/project-form.tsx`
- Create: `resources/js/components/projects/project-card.tsx`
- Create: `resources/js/components/projects/project-upload-dropzone.tsx`
- Create: `resources/js/components/projects/project-asset-grid.tsx`
- Create: `resources/js/components/projects/project-ai-sidebar.tsx`
- Create: `resources/js/components/projects/project-share-panel.tsx`
- Create: `resources/js/components/public/public-project-grid.tsx`
- Create: `resources/js/components/client/client-favorites-panel.tsx`
- Create: `resources/js/types/project.ts`

### Test files to add

- Create: `tests/Feature/Projects/ProjectCrudTest.php`
- Create: `tests/Feature/Projects/ProjectAssetUploadTest.php`
- Create: `tests/Feature/Projects/ProjectPublishingTest.php`
- Create: `tests/Feature/Public/PublicProfileTest.php`
- Create: `tests/Feature/Client/ClientGalleryTest.php`
- Create: `tests/Feature/Ai/ProjectAssetAnalysisTest.php`
- Create: `tests/Unit/Projects/GenerateProjectShareActionTest.php`
- Create: `tests/Unit/Ai/GenerateProjectHighlightsActionTest.php`

## Delivery Principles

- Всеки task трябва да приключва с минаващи таргетирани Pest тестове.
- AI обработката върви асинхронно с jobs и отделна таблица за резултати, за да не блокира upload flow.
- Публичните и клиентските страници стъпват върху един и същи `projects` домейн, а не върху отделни ad hoc структури.
- Optional ideas от спецификацията като watermark, Instagram integration и one-click portfolio generation се оставят за post-MVP phase.

### Task 1: Domain Foundation and Project Schema

**Files:**
- Create: `database/migrations/2026_05_06_170000_create_projects_table.php`
- Create: `database/migrations/2026_05_06_170100_create_project_assets_table.php`
- Create: `database/migrations/2026_05_06_170200_create_project_asset_analyses_table.php`
- Create: `database/migrations/2026_05_06_170300_create_project_shares_table.php`
- Create: `database/migrations/2026_05_06_170400_create_client_selections_table.php`
- Create: `app/Models/Project.php`
- Create: `app/Models/ProjectAsset.php`
- Create: `app/Models/ProjectAssetAnalysis.php`
- Create: `app/Models/ProjectShare.php`
- Create: `app/Models/ClientSelection.php`
- Create: `app/Enums/ProjectVisibility.php`
- Create: `app/Enums/ProjectStatus.php`
- Create: `app/Enums/ProjectAssetMood.php`
- Create: `database/factories/ProjectFactory.php`
- Create: `database/factories/ProjectAssetFactory.php`
- Test: `tests/Feature/Projects/ProjectCrudTest.php`

- [ ] **Step 1: Write the failing project CRUD test**

```php
<?php

use App\Models\User;

it('lets an authenticated creator create a project', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('projects.store'), [
            'name' => 'Spring Wedding',
            'category' => 'Weddings',
            'description' => 'Golden hour ceremony',
        ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('projects', [
        'user_id' => $user->id,
        'name' => 'Spring Wedding',
        'category' => 'Weddings',
        'status' => 'draft',
    ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/Projects/ProjectCrudTest.php`
Expected: FAIL with missing route or missing table error.

- [ ] **Step 3: Create migrations, enums, models, factories, and relationships**

```php
Schema::create('projects', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('category');
    $table->text('description')->nullable();
    $table->string('status', 20)->default('draft');
    $table->string('visibility', 20)->default('private');
    $table->unsignedBigInteger('cover_asset_id')->nullable();
    $table->timestamp('published_at')->nullable();
    $table->timestamps();

    $table->index(['user_id', 'status']);
    $table->index(['visibility', 'published_at']);
});
```

```php
class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'category',
        'description',
        'status',
        'visibility',
        'cover_asset_id',
        'published_at',
    ];

    public function assets(): HasMany
    {
        return $this->hasMany(ProjectAsset::class);
    }
}
```

- [ ] **Step 4: Run test to verify schema is now usable once routes exist later**

Run: `php artisan test --compact tests/Feature/Projects/ProjectCrudTest.php --filter=create`
Expected: FAIL with route/controller error instead of migration error.

- [ ] **Step 5: Commit**

```bash
git add database/migrations database/factories app/Models app/Enums tests/Feature/Projects/ProjectCrudTest.php
git commit -m "feat: add creativehub project domain schema"
```

### Task 2: Project CRUD and Dashboard Integration

**Files:**
- Modify: `routes/web.php`
- Create: `app/Http/Controllers/Projects/ProjectController.php`
- Create: `app/Http/Requests/Projects/StoreProjectRequest.php`
- Create: `app/Http/Requests/Projects/UpdateProjectRequest.php`
- Create: `app/Actions/Projects/CreateProjectAction.php`
- Create: `resources/js/pages/projects/index.tsx`
- Create: `resources/js/pages/projects/create.tsx`
- Create: `resources/js/components/projects/project-form.tsx`
- Create: `resources/js/components/projects/project-card.tsx`
- Modify: `resources/js/pages/dashboard.tsx`
- Create: `resources/js/types/project.ts`
- Test: `tests/Feature/Projects/ProjectCrudTest.php`

- [ ] **Step 1: Extend the failing test for index and update flows**

```php
it('shows only the authenticated creators projects on the dashboard project list', function () {
    $user = User::factory()->create();
    $ownProject = Project::factory()->for($user)->create(['name' => 'Own Project']);
    Project::factory()->create(['name' => 'Other Project']);

    $this->actingAs($user)
        ->get(route('projects.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('projects/index')
            ->where('projects.0.name', $ownProject->name)
        );
});
```

- [ ] **Step 2: Run test to verify routing/controller gaps**

Run: `php artisan test --compact tests/Feature/Projects/ProjectCrudTest.php`
Expected: FAIL with route not defined or controller response mismatch.

- [ ] **Step 3: Implement project routes, validation, action, and Inertia pages**

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('projects', ProjectController::class)->except(['destroy']);
});
```

```php
public function store(StoreProjectRequest $request, CreateProjectAction $action): RedirectResponse
{
    $project = $action->handle($request->user(), $request->validated());

    return to_route('projects.show', $project)->with('success', 'Project created.');
}
```

```tsx
export default function ProjectsIndex({ projects }: PageProps<{ projects: Project[] }>) {
    return (
        <AppLayout>
            <Head title="Projects" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 4: Update the dashboard to show actual project summaries instead of placeholders**

```tsx
<section className="grid gap-4 md:grid-cols-3">
    {stats.map((stat) => (
        <Card key={stat.label}>
            <CardHeader>{stat.label}</CardHeader>
            <CardContent>{stat.value}</CardContent>
        </Card>
    ))}
</section>
```

- [ ] **Step 5: Run tests to verify CRUD passes**

Run: `php artisan test --compact tests/Feature/Projects/ProjectCrudTest.php`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add routes/web.php app/Http/Controllers/Projects app/Http/Requests/Projects app/Actions/Projects resources/js/pages/projects resources/js/components/projects resources/js/types/project.ts resources/js/pages/dashboard.tsx tests/Feature/Projects/ProjectCrudTest.php
git commit -m "feat: add project CRUD and dashboard project list"
```

### Task 3: Asset Upload Pipeline and Project Manager Shell

**Files:**
- Create: `app/Http/Controllers/Projects/ProjectAssetController.php`
- Create: `app/Http/Requests/Projects/StoreProjectAssetRequest.php`
- Create: `app/Actions/Projects/UploadProjectAssetsAction.php`
- Create: `resources/js/pages/projects/show.tsx`
- Create: `resources/js/components/projects/project-upload-dropzone.tsx`
- Create: `resources/js/components/projects/project-asset-grid.tsx`
- Test: `tests/Feature/Projects/ProjectAssetUploadTest.php`

- [ ] **Step 1: Write the failing asset upload test**

```php
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('uploads images into a project and stores metadata', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $project = Project::factory()->for($user)->create();

    $response = $this->actingAs($user)->post(route('projects.assets.store', $project), [
        'files' => [
            UploadedFile::fake()->image('frame-1.jpg', 2400, 1600),
            UploadedFile::fake()->image('frame-2.jpg', 2400, 1600),
        ],
    ]);

    $response->assertRedirect();

    expect($project->fresh()->assets)->toHaveCount(2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact tests/Feature/Projects/ProjectAssetUploadTest.php`
Expected: FAIL with missing nested route or controller.

- [ ] **Step 3: Implement nested asset routes, validation, storage, and project manager screen**

```php
Route::post('projects/{project}/assets', [ProjectAssetController::class, 'store'])
    ->name('projects.assets.store');
```

```php
public function rules(): array
{
    return [
        'files' => ['required', 'array', 'min:1', 'max:50'],
        'files.*' => ['required', 'image', 'max:15360'],
    ];
}
```

```php
$path = $uploadedFile->store("projects/{$project->id}", 'public');

$project->assets()->create([
    'disk' => 'public',
    'path' => $path,
    'filename' => $uploadedFile->getClientOriginalName(),
    'mime_type' => $uploadedFile->getMimeType(),
    'size' => $uploadedFile->getSize(),
    'width' => $dimensions[0],
    'height' => $dimensions[1],
    'sort_order' => $sortOrder,
]);
```

- [ ] **Step 4: Render drag-and-drop upload plus asset grid in `projects/show`**

```tsx
<ProjectUploadDropzone projectId={project.id} />
<ProjectAssetGrid assets={project.assets} />
```

- [ ] **Step 5: Run tests to verify uploads pass**

Run: `php artisan test --compact tests/Feature/Projects/ProjectAssetUploadTest.php`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Projects/ProjectAssetController.php app/Http/Requests/Projects/StoreProjectAssetRequest.php app/Actions/Projects/UploadProjectAssetsAction.php resources/js/pages/projects/show.tsx resources/js/components/projects/project-upload-dropzone.tsx resources/js/components/projects/project-asset-grid.tsx tests/Feature/Projects/ProjectAssetUploadTest.php
git commit -m "feat: add project asset upload pipeline"
```

### Task 4: AI Analysis MVP for Tags, Alt Text, Critique, and Highlights

**Files:**
- Modify: `config/ai.php`
- Create: `app/Actions/Ai/AnalyzeProjectAssetAction.php`
- Create: `app/Actions/Ai/GenerateProjectHighlightsAction.php`
- Create: `app/Jobs/Ai/AnalyzeProjectAssetJob.php`
- Create: `app/Jobs/Ai/RefreshProjectHighlightsJob.php`
- Create: `app/Support/Ai/ProjectAssetAnalysisData.php`
- Create: `tests/Feature/Ai/ProjectAssetAnalysisTest.php`
- Create: `tests/Unit/Ai/GenerateProjectHighlightsActionTest.php`

- [ ] **Step 1: Write the failing AI asset analysis test**

```php
use Laravel\Ai\Testing\Fakes\FakeProvider;
use Laravel\Ai\Ai;

it('stores tags, alt text, critique scores, and notes after analysis job runs', function () {
    Queue::fake();

    $project = Project::factory()
        ->has(ProjectAsset::factory()->count(1))
        ->create();

    $this->actingAs($project->user)
        ->post(route('projects.assets.store', $project), [
            'files' => [UploadedFile::fake()->image('hero.jpg')],
        ]);

    Queue::assertPushed(AnalyzeProjectAssetJob::class);
});
```

- [ ] **Step 2: Run test to verify the queue/analysis path is missing**

Run: `php artisan test --compact tests/Feature/Ai/ProjectAssetAnalysisTest.php`
Expected: FAIL with missing job dispatch or missing analysis record.

- [ ] **Step 3: Implement the AI analysis action and persisted output contract**

```php
final class ProjectAssetAnalysisData
{
    public function __construct(
        public array $tags,
        public string $altText,
        public int $compositionScore,
        public int $focusScore,
        public int $lightingScore,
        public string $critique,
        public ?string $mood,
        public bool $isHighlight,
        public bool $isNearDuplicate,
    ) {
    }
}
```

```php
$asset->analysis()->updateOrCreate([], [
    'tags' => $analysis->tags,
    'alt_text' => $analysis->altText,
    'composition_score' => $analysis->compositionScore,
    'focus_score' => $analysis->focusScore,
    'lighting_score' => $analysis->lightingScore,
    'critique' => $analysis->critique,
    'mood' => $analysis->mood,
    'is_highlight' => $analysis->isHighlight,
    'is_near_duplicate' => $analysis->isNearDuplicate,
]);
```

- [ ] **Step 4: Dispatch analysis on upload and refresh project-level highlights**

```php
AnalyzeProjectAssetJob::dispatch($asset->id);
RefreshProjectHighlightsJob::dispatch($project->id)->delay(now()->addSeconds(5));
```

- [ ] **Step 5: Run targeted AI tests**

Run: `php artisan test --compact tests/Feature/Ai/ProjectAssetAnalysisTest.php tests/Unit/Ai/GenerateProjectHighlightsActionTest.php`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add config/ai.php app/Actions/Ai app/Jobs/Ai app/Support/Ai tests/Feature/Ai tests/Unit/Ai
git commit -m "feat: add ai photo analysis and highlights pipeline"
```

### Task 5: AI Sidebar and Curator Presence in Project Manager

**Files:**
- Create: `resources/js/components/projects/project-ai-sidebar.tsx`
- Modify: `resources/js/pages/projects/show.tsx`
- Modify: `app/Http/Controllers/Projects/ProjectController.php`
- Test: `tests/Feature/Projects/ProjectAssetUploadTest.php`

- [ ] **Step 1: Extend the project page test to expect analysis data in Inertia props**

```php
it('shows ai analysis data on the project manager page', function () {
    $project = Project::factory()
        ->has(ProjectAsset::factory()->count(1))
        ->create();

    ProjectAssetAnalysis::factory()->for($project->assets->first(), 'asset')->create([
        'tags' => ['portrait', 'warm'],
        'alt_text' => 'Portrait during sunset',
        'critique' => 'Strong composition with soft light.',
    ]);

    $this->actingAs($project->user)
        ->get(route('projects.show', $project))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('project.assets.0.analysis.alt_text', 'Portrait during sunset')
        );
});
```

- [ ] **Step 2: Run the page test to verify the props are incomplete**

Run: `php artisan test --compact tests/Feature/Projects/ProjectAssetUploadTest.php --filter=analysis`
Expected: FAIL with missing eager load or missing prop structure.

- [ ] **Step 3: Expose analysis data and render the Curator sidebar**

```tsx
<aside className="sticky top-6 space-y-4">
    <ProjectAiSidebar
        assistantName="Curator"
        project={project}
        highlights={project.highlights}
    />
</aside>
```

```tsx
<p className="text-sm text-muted-foreground">
    Hey, анализирах снимките ти. Имаш {highlights.length} силни кадъра в акцентите.
</p>
```

- [ ] **Step 4: Run the feature test again**

Run: `php artisan test --compact tests/Feature/Projects/ProjectAssetUploadTest.php`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add resources/js/components/projects/project-ai-sidebar.tsx resources/js/pages/projects/show.tsx app/Http/Controllers/Projects/ProjectController.php tests/Feature/Projects/ProjectAssetUploadTest.php
git commit -m "feat: surface ai curator insights in project manager"
```

### Task 6: Publishing, Public Profile, and Public Project Pages

**Files:**
- Create: `app/Http/Controllers/Projects/ProjectPublishController.php`
- Create: `app/Http/Requests/Projects/PublishProjectRequest.php`
- Create: `app/Actions/Projects/GenerateProjectShareAction.php`
- Create: `app/Http/Controllers/PublicProfileController.php`
- Create: `app/Http/Controllers/PublicProjectController.php`
- Create: `resources/js/pages/public/profile.tsx`
- Create: `resources/js/pages/public/project.tsx`
- Create: `resources/js/components/public/public-project-grid.tsx`
- Create: `resources/js/components/projects/project-share-panel.tsx`
- Test: `tests/Feature/Projects/ProjectPublishingTest.php`
- Test: `tests/Feature/Public/PublicProfileTest.php`
- Test: `tests/Unit/Projects/GenerateProjectShareActionTest.php`

- [ ] **Step 1: Write failing publish and public visibility tests**

```php
it('publishes a project to the creators public profile', function () {
    $user = User::factory()->create(['name' => 'Elena Petrova']);
    $project = Project::factory()->for($user)->create(['visibility' => 'private']);

    $this->actingAs($user)->post(route('projects.publish.store', $project), [
        'visibility' => 'public',
    ])->assertRedirect();

    $this->get(route('portfolio.show', $user))
        ->assertOk()
        ->assertSee($project->name);
});
```

- [ ] **Step 2: Run tests to verify publishing routes and public pages do not exist yet**

Run: `php artisan test --compact tests/Feature/Projects/ProjectPublishingTest.php tests/Feature/Public/PublicProfileTest.php`
Expected: FAIL with missing route/controller error.

- [ ] **Step 3: Implement publish flow and public profile rendering**

```php
Route::post('projects/{project}/publish', [ProjectPublishController::class, 'store'])
    ->name('projects.publish.store');

Route::get('/portfolio/{user}', PublicProfileController::class)->name('portfolio.show');
Route::get('/portfolio/{user}/{project:slug}', PublicProjectController::class)->name('portfolio.project.show');
```

```php
$project->update([
    'visibility' => $data['visibility'],
    'status' => 'published',
    'published_at' => now(),
]);
```

- [ ] **Step 4: Add owner-side share panel for public links**

```tsx
<ProjectSharePanel
    publicUrl={project.public_url}
    clientUrl={project.client_url}
    visibility={project.visibility}
/>
```

- [ ] **Step 5: Run publish and public tests**

Run: `php artisan test --compact tests/Feature/Projects/ProjectPublishingTest.php tests/Feature/Public/PublicProfileTest.php tests/Unit/Projects/GenerateProjectShareActionTest.php`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Projects/ProjectPublishController.php app/Http/Requests/Projects/PublishProjectRequest.php app/Actions/Projects/GenerateProjectShareAction.php app/Http/Controllers/PublicProfileController.php app/Http/Controllers/PublicProjectController.php resources/js/pages/public resources/js/components/public resources/js/components/projects/project-share-panel.tsx tests/Feature/Projects/ProjectPublishingTest.php tests/Feature/Public/PublicProfileTest.php tests/Unit/Projects/GenerateProjectShareActionTest.php
git commit -m "feat: add public portfolio publishing flow"
```

### Task 7: Client Gallery with Password Access and Favorites

**Files:**
- Create: `app/Http/Controllers/ClientGalleryController.php`
- Create: `app/Http/Requests/Client/ToggleFavoriteRequest.php`
- Create: `resources/js/pages/projects/client.tsx`
- Create: `resources/js/components/client/client-favorites-panel.tsx`
- Test: `tests/Feature/Client/ClientGalleryTest.php`

- [ ] **Step 1: Write the failing client gallery test**

```php
it('lets a client mark favorite images in a password-protected gallery', function () {
    $project = Project::factory()->create(['visibility' => 'client']);
    $share = ProjectShare::factory()->for($project)->create([
        'password' => bcrypt('secret-pass'),
    ]);

    $asset = ProjectAsset::factory()->for($project)->create();

    session(['client_gallery_access.'.$share->id => true]);

    $this->post(route('client-galleries.favorites.toggle', $share), [
        'asset_id' => $asset->id,
        'is_favorite' => true,
    ])->assertOk();

    $this->assertDatabaseHas('client_selections', [
        'project_share_id' => $share->id,
        'project_asset_id' => $asset->id,
        'is_favorite' => true,
    ]);
});
```

- [ ] **Step 2: Run test to verify client gallery endpoints are absent**

Run: `php artisan test --compact tests/Feature/Client/ClientGalleryTest.php`
Expected: FAIL with missing route/controller or session gate logic.

- [ ] **Step 3: Implement password gate, gallery page, and favorite toggling**

```php
Route::get('/galleries/{share:token}', [ClientGalleryController::class, 'show'])
    ->name('client-galleries.show');

Route::post('/galleries/{share:token}/favorites', [ClientGalleryController::class, 'toggleFavorite'])
    ->name('client-galleries.favorites.toggle');
```

```tsx
<ClientFavoritesPanel
    favoritesCount={favoritesCount}
    onToggleFavorite={toggleFavorite}
/>
```

- [ ] **Step 4: Run the client gallery tests**

Run: `php artisan test --compact tests/Feature/Client/ClientGalleryTest.php`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ClientGalleryController.php app/Http/Requests/Client/ToggleFavoriteRequest.php resources/js/pages/projects/client.tsx resources/js/components/client/client-favorites-panel.tsx tests/Feature/Client/ClientGalleryTest.php
git commit -m "feat: add client gallery favorites flow"
```

### Task 8: Explore Feed and Portfolio Intelligence Widgets

**Files:**
- Modify: `app/Http/Controllers/Projects/ProjectController.php`
- Create: `app/Http/Controllers/ExploreController.php`
- Create: `resources/js/pages/explore/index.tsx`
- Modify: `resources/js/pages/dashboard.tsx`
- Test: `tests/Feature/Public/PublicProfileTest.php`

- [ ] **Step 1: Write a failing explore feed test for published projects**

```php
it('shows published public projects in explore', function () {
    $project = Project::factory()->published()->create(['visibility' => 'public']);

    $this->get(route('explore.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('explore/index')
            ->where('projects.0.slug', $project->slug)
        );
});
```

- [ ] **Step 2: Run the test to verify explore is still missing**

Run: `php artisan test --compact tests/Feature/Public/PublicProfileTest.php --filter=explore`
Expected: FAIL with missing route or component.

- [ ] **Step 3: Implement explore page and dashboard AI portfolio advice widget**

```php
Route::get('/explore', ExploreController::class)->name('explore.index');
```

```tsx
<section className="rounded-2xl border p-6">
    <h2 className="text-lg font-semibold">AI Portfolio Advice</h2>
    <p className="text-sm text-muted-foreground">
        Имаш нужда от повече публикувани проекти в категория Weddings.
    </p>
</section>
```

- [ ] **Step 4: Run targeted public tests**

Run: `php artisan test --compact tests/Feature/Public/PublicProfileTest.php`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ExploreController.php resources/js/pages/explore/index.tsx resources/js/pages/dashboard.tsx tests/Feature/Public/PublicProfileTest.php
git commit -m "feat: add explore feed and ai portfolio advice"
```

### Task 9: Polish, Authorization, Seed Data, and Regression Coverage

**Files:**
- Modify: `app/Providers/AppServiceProvider.php`
- Modify: `database/seeders/DatabaseSeeder.php`
- Modify: `tests/Feature/Projects/ProjectCrudTest.php`
- Modify: `tests/Feature/Projects/ProjectAssetUploadTest.php`
- Modify: `tests/Feature/Projects/ProjectPublishingTest.php`
- Modify: `tests/Feature/Public/PublicProfileTest.php`
- Modify: `tests/Feature/Client/ClientGalleryTest.php`

- [ ] **Step 1: Add failing authorization assertions across feature tests**

```php
it('forbids one creator from editing another creators project', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $project = Project::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->patch(route('projects.update', $project), [
            'name' => 'Hijacked',
            'category' => $project->category,
        ])
        ->assertForbidden();
});
```

- [ ] **Step 2: Run the core feature suites to expose missing policies and regressions**

Run: `php artisan test --compact tests/Feature/Projects tests/Feature/Public tests/Feature/Client`
Expected: FAIL with authorization or edge-case regressions.

- [ ] **Step 3: Add policies, eager loading cleanups, seed data, and pagination hardening**

```php
Gate::policy(Project::class, ProjectPolicy::class);
```

```php
Project::query()
    ->with(['assets.analysis', 'user'])
    ->published()
    ->latest('published_at')
    ->paginate(12);
```

- [ ] **Step 4: Run the regression suite and code formatters**

Run: `php artisan test --compact tests/Feature/Projects tests/Feature/Public tests/Feature/Client tests/Feature/Ai`
Expected: PASS

Run: `vendor/bin/pint --dirty --format agent`
Expected: PASS with zero remaining style changes.

- [ ] **Step 5: Commit**

```bash
git add app database tests
git commit -m "chore: harden creativehub authorization and regression coverage"
```

## Post-MVP Backlog

These items are intentionally deferred until the core platform is stable:

- Watermarking for client galleries
- AI preset suggestions per image
- One-click AI generated portfolio page across all projects
- Instagram publishing integration
- Likes, views, and inquiry analytics with real counters instead of placeholders
- Duplicate clustering UI beyond binary near-duplicate detection

## Spec Coverage Self-Review

### Covered requirements

- Registration/login: already present via Fortify; plan builds on it.
- Dashboard: Task 2 and Task 8 replace placeholders with real project and AI summary data.
- Create project: Task 2.
- Upload photos: Task 3.
- AI processing after upload: Task 4.
- Publish/share public or client project: Task 6 and Task 7.
- AI SEO tags and alt text: Task 4.
- AI critique and cover/highlight selection: Task 4 and Task 5.
- Smart grouping by mood and duplicate detection: Task 4 data model and analysis contract.
- Project manager with upload and AI sidebar: Task 3 and Task 5.
- Public profile: Task 6.
- Client gallery with favorites: Task 7.
- Explore community page: Task 8.
- AI assistant persona/presence: Task 5.

### Deferred or narrowed requirements

- Watermarking is deferred to post-MVP backlog.
- Instagram integration is deferred to post-MVP backlog.
- Portfolio in one minute is deferred until public portfolio and highlight ranking are stable.
- Dashboard analytics are introduced first as structural widgets; real counters can follow once events and inquiries exist.

### Consistency check

- `projects` remains the single source of truth for draft, public, and client presentations.
- `project_assets` stores upload metadata; `project_asset_analyses` stores AI output; `project_shares` handles public/client link exposure.
- AI work stays async through jobs, so upload UX remains responsive.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-06-creativehub-ai-platform.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
