<?php


abstract class DataCollectionTypeSafe implements JsonSerializable {


    public function jsonSerialize() {

        $jsonData = [];

        foreach ($this as $key => $value) {

            if (substr($key,0 ,1) != '_') {
                $jsonData[$key] = $value;
            }
        }

        return $jsonData;
    }
}
