<?php
/** @noinspection PhpUnhandledExceptionInspection */
declare(strict_types=1);


class XMLFileUnit extends XMLFile {

    const type = 'Unit';
    const canBeRelationSubject = true;
    const canBeRelationObject = true;

    const deprecatedElements = [
        '/Unit/Definition/@type',
        '/Unit/Metadata/Lastchange',
        '/Unit/Dependencies/file'
    ];

    protected string $playerId = '';
    private array $dependencies = []; // TODO! we need this anymore?

    public function __construct(string | FileData $init, bool $validate = false, bool $isRawXml = false) {

        parent::__construct($init, $validate, $isRawXml);

        if (is_a($init, FileData::class)) {
            return;
        }

        $this->checkRequestedAttachments();

        if ($this->isValid()) {
            $this->playerId = $this->readPlayerId();
            $this->dependencies = $this->readPlayerDependencies();
        }
    }

    public function crossValidate(WorkspaceValidator $validator) : void {

        parent::crossValidate($validator);

        $this->checkIfResourcesExist($validator);
        $this->getPlayerIfExists($validator);
    }


    public function getPlayerIfExists(WorkspaceValidator $validator): ?ResourceFile {

        if (!$this->isValid()) {
            return null;
        }

        $resource = $validator->getResource($this->playerId, true);

        if ($resource != null) {
            $this->addRelation(new FileRelation($resource->getType(), $resource->getId(), FileRelationshipType::usesPlayer));
        } else {
            $this->report('error', "No suitable version of `$this->playerId` found");
        }

        return $resource;
    }


    private function checkIfResourcesExist(WorkspaceValidator $validator): void {

        $this->contextData['totalSize'] = $this->size;

        $definitionRef = $this->getDefinitionRef();

        $resources = $this->readPlayerDependencies();

        if ($definitionRef) {
            $resources['definition'] = $definitionRef;
        }

        foreach ($resources as $key => $resourceName) {

            $resourceId = FileName::normalize($resourceName, false);
            $resource = $validator->getResource($resourceId, false);
            if ($resource != null) {
                $relationshipType = ($key === 'definition') ? FileRelationshipType::isDefinedBy : FileRelationshipType::usesPlayerResource;
                $this->addRelation(new FileRelation($resource->getType(), $resource->getId(), $relationshipType));
                $this->contextData['totalSize'] += $resource->getSize();
            } else {
                $this->report('error', "Resource `$resourceName` not found");
            }
        }
    }


    public function getTotalSize(): int {

        return $this->contextData['totalSize'];
    }


    public function getPlayerId(): string {

        return $this->playerId;
    }


    public function readPlayerId(): string {

        if (!$this->isValid()) {
            return '';
        }

        $definition = $this->xml->xpath('/Unit/Definition | /Unit/DefinitionRef');
        if (count($definition)) {
            $playerId = strtoupper((string) $definition[0]['player']);
            if (substr($playerId, -5) != '.HTML') {
                $playerId = $playerId . '.HTML';
            }
            return $playerId;
        }

        return '';
    }


    public function getUnitDefinition(WorkspaceValidator $workspaceValidator): string {

        $this->crossValidate($workspaceValidator);
        if (!$this->isValid()) {
            return '';
        }

        $definitionNode = $this->xml->xpath('/Unit/Definition');
        if (count($definitionNode)) {
            return (string) $definitionNode[0];
        }

        $definitionRef = (string) $this->xml->xpath('/Unit/DefinitionRef')[0];
        $unitContentFile = $workspaceValidator->getResource($definitionRef, true);

        if (!$unitContentFile) {
            throw new HttpError("Resource not found: `$definitionRef`");
        }

        return $unitContentFile->getContent();
    }


    public function getDefinitionRef(): string {

        $definitionRefNodes = $this->xml->xpath('/Unit/DefinitionRef');
        return count($definitionRefNodes) ? (string) $definitionRefNodes[0] : '';
    }


    public function getDefinition(): string {

        $definitionNodes = $this->xml->xpath('/Unit/Definition');
        return count($definitionNodes) ? (string) $definitionNodes[0] : '';
    }


    private function readPlayerDependencies(): array {

        if (!$this->isValid()) {
            return [];
        }

        return array_map(
            function($e) { return (string) $e;},
            $this->xml->xpath('/Unit/Dependencies/file[not(@for) or @for="player"]|File[not(@for) or @for="player"]')
        );
    }


    private function checkRequestedAttachments(): void {

        $requestedAttachments = $this->getRequestedAttachments();
        $requestedAttachmentsCount = count($requestedAttachments);
        if ($requestedAttachmentsCount) {
            $this->report('info', "`{$requestedAttachmentsCount}` attachment(s) requested.");
        }
    }


    public function getRequestedAttachments(): array {

        $variables = $this->xml->xpath('/Unit/BaseVariables/Variable[@type="attachment"]');
        $requestedAttachments = [];
        foreach ($variables as $variable) {

            if (!is_a($variable, SimpleXMLElement::class)) {
                continue;
            }

            $requestedAttachments[] = new RequestedAttachment(
                $this->getId(),
                (string) $variable['format'],
                (string) $variable['id']
            );
        }

        return $requestedAttachments;
    }
}
