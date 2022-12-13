<?php
declare(strict_types=1);

class FileData extends DataCollectionTypeSafe {

    protected string | null $type;
    protected string $path = '';
    protected string $id = '';
    protected string $label = '';
    protected string $description = '';
    protected array $relations = [];
    private bool $isValid;
    private array $validationReport;
    protected int $modificationTime = 0;
    protected int $size = 0;

    public function __construct(
        string $path = '',
        string $type = null,
        string $id = '',
        string $label = '',
        string $description = '',
        bool $isValid = true,
        array $validationReport = [],
        array $relations = [],
        int $modificationTime = 0,
        int $size = 0
    ) {
        $this->path = $path;
        $this->type = $type;
        $this->id = $id;
        $this->label = $label;
        $this->description = $description;
        $this->isValid = $isValid;
        $this->validationReport = $validationReport;
        $this->relations = $relations;
        $this->modificationTime = $modificationTime;
        $this->size = $size;
    }


    public function getType(): string {

        return $this->type;
    }


    public function getPath(): string {

        return $this->path;
    }


    public function getSize(): int {

        return $this->size;
    }


    public function getId(): string {

        return $this->id;
    }


    public function getLabel(): string {

        return $this->label;
    }


    public function getDescription(): string {

        return $this->description;
    }


    public function getRelations(): array {

        return $this->relations;
    }


    public function isValid(): bool {

        return $this->isValid;
    }


    public function getValidationReport(): array {

        return $this->validationReport;
    }


    public function getModificationTime(): int {

        return $this->modificationTime;
    }
}