> Reference snapshot from [milvus-io/milvus-docs](https://github.com/milvus-io/milvus-docs/blob/79341af3be75a66425e5972ea26d1d9c90705fd7/site/en/userGuide/schema/schema.md), Apache-2.0. Trailing whitespace is normalized. Relative links have been made absolute; SDK/Lite version placeholders, where present, are resolved to 3.0.2/3.2.2. See LICENSE-milvus-docs.txt.

---
id: schema.md
title: Schema Explained
summary: A schema defines the data structure of a collection. Before creating a collection, you need to work out a design of its schema. This page helps you understand the collection schema and design an example schema on your own.​
---

# Schema Explained​

A schema defines the data structure of a collection. Before creating a collection, you need to work out a design of its schema. This page helps you understand the collection schema and design an example schema on your own.​

## Overview​

In Milvus, a collection schema assembles a table in a relational database, which defines how Milvus organizes data in the collection. ​

A well-designed schema is essential as it abstracts the data model and decides if you can achieve the business objectives through a search. Furthermore, since every row of data inserted into the collection must follow the schema, it helps maintain data consistency and long-term quality. From a technical perspective, a well-defined schema leads to well-organized column data storage and a cleaner index structure, boosting search performance.​

A collection schema has a primary key, a maximum of four vector fields, and several scalar fields. The following diagram illustrates how to map an article to a list of schema fields.​

![Schema design](https://milvus-docs.s3.us-west-2.amazonaws.com/assets/schema-explained.png)

The data model design of a search system involves analyzing business needs and abstracting information into a schema-expressed data model. For instance, searching a piece of text must be "indexed" by converting the literal string into a vector through "embedding" and enabling vector search. Beyond this essential requirement, storing other properties such as publication timestamp and author may be necessary. This metadata allows for semantic searches to be refined through filtering, returning only texts published after a specific date or by a particular author. You can also retrieve these scalars with the main text to render the search result in the application. Each should be assigned a unique identifier to organize these text pieces, expressed as an integer or string. These elements are essential for achieving sophisticated search logic.​

Refer to [Schema Design Hands-On](https://milvus.io/docs/schema-hands-on.md) to figure out how to make a well-designed schema.​

## Create Schema​

The following code snippet demonstrates how to create a schema.​

<div class="multipleCode">
  <a href="#python">Python </a>
  <a href="#java">Java</a>
  <a href="#javascript">Node.js</a>
  <a href="#curl">cURL</a>
</div>

```python
from pymilvus import MilvusClient, DataType​
​
schema = MilvusClient.create_schema()​

```

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;​
​
CreateCollectionReq.CollectionSchema schema = client.createSchema();​

```

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";​
​
const schema = []​

```

```curl
export schema='{​
    "fields": []​
}'​

```

## Add Primary Field​

The primary field in a collection uniquely identifies an entity. It only accepts **Int64** or **VARCHAR** values. The following code snippets demonstrate how to add the primary field.​

<div class="multipleCode">
  <a href="#python">Python </a>
  <a href="#java">Java</a>
  <a href="#javascript">Node.js</a>
  <a href="#curl">cURL</a>
</div>

```python
schema.add_field(​
    field_name="my_id",​
    datatype=DataType.INT64,​
    # highlight-start​
    is_primary=True,​
    auto_id=False,​
    # highlight-end​
)​

```

```java
import io.milvus.v2.common.DataType;​
import io.milvus.v2.service.collection.request.AddFieldReq; ​
​
schema.addField(AddFieldReq.builder()​
        .fieldName("my_id")​
        .dataType(DataType.Int64)​
        // highlight-start​
        .isPrimaryKey(true)​
        .autoID(false)​
        // highlight-end​
        .build());​

```

```javascript
schema.push({​
    name: "my_id",​
    data_type: DataType.Int64,​
    // highlight-start​
    is_primary_key: true,​
    autoID: false​
    // highlight-end​
});​

```

```curl
export primaryField='{​
    "fieldName": "my_id",​
    "dataType": "Int64",​
    "isPrimary": true​
}'​
​
export schema='{​
    \"autoID\": false,​
    \"fields\": [​
        $primaryField​
    ]​
}'​

```

When adding a field, you can explicitly clarify the field as the primary field by setting its `is_primary` property to `True`. A primary field accepts **Int64** values by default. In this case, the primary field value should be integers similar to `12345`. If you choose to use **VARCHAR** values in the primary field, the value should be strings similar to `my_entity_1234`.​

You can also set the `autoId` properties to `True` to make Milvus automatically allocate primary field values upon data insertions.​

For details, refer to [​Primary Field & AutoID](https://milvus.io/docs/primary-field.md).​

## Add Vector Fields​

Vector fields accept various sparse and dense vector embeddings. In Milvus, you can add four vector fields to a collection. The following code snippets demonstrate how to add a vector field.​

<div class="multipleCode">
  <a href="#python">Python </a>
  <a href="#java">Java</a>
  <a href="#javascript">Node.js</a>
  <a href="#curl">cURL</a>
</div>

```python
schema.add_field(​
    field_name="my_vector",​
    datatype=DataType.FLOAT_VECTOR,​
    # highlight-next-line​
    dim=5​
)​

```

```java
schema.addField(AddFieldReq.builder()​
        .fieldName("my_vector")​
        .dataType(DataType.FloatVector)​
        // highlight-next-line​
        .dimension(5)​
        .build());​

```

```javascript
schema.push({​
    name: "my_vector",​
    data_type: DataType.FloatVector,​
    // highlight-next-line​
    dim: 5​
});​

```

```curl
export vectorField='{​
    "fieldName": "my_vector",​
    "dataType": "FloatVector",​
    "elementTypeParams": {​
        "dim": 5​
    }​
}'​
​
export schema="{​
    \"autoID\": false,​
    \"fields\": [​
        $primaryField,​
        $vectorField​
    ]​
}"​

```

The `dim` paramter in the above code snippets indicates the dimensionality of the vector embeddings to be held in the vector field. The `FLOAT_VECTOR` value indicates that the vector field holds a list of 32-bit floating numbers, which are usually used to represent antilogarithms.In addition to that, Milvus also supports the following types of vector embeddings:​

- `FLOAT16_VECTOR`​

    A vector field of this type holds a list of 16-bit half-precision floating numbers and usually applies to memory- or bandwidth-restricted deep learning or GPU-based computing scenarios.​

- `BFLOAT16_VECTOR`​

    A vector field of this type holds a list of 16-bit floating-point numbers that have reduced precision but the same exponent range as Float32. This type of data is commonly used in deep learning scenarios, as it reduces memory usage without significantly impacting accuracy.​

- `BINARY_VECTOR`​

    A vector field of this type holds a list of 0s and 1s. They serve as compact features for representing data in image processing and information retrieval scenarios.​

- `SPARSE_FLOAT_VECTOR`​

    A vector field of this type holds a list of non-zero numbers and their sequence numbers to represent sparse vector embeddings.​

## Add Scalar Fields​

In common cases, you can use scalar fields to store the metadata of the vector embeddings stored in Milvus, and conduct ANN searches with metadata filtering to improve the correctness of the search results. Milvus supports multiple scalar field types, including **VARCHAR**, **TEXT**, **Boolean**, **Int**, Float, **Double**, **Array**, and JSON.​

### Add VARCHAR Fields​

In Milvus, you can use `VARCHAR` fields to store strings. For more on the `VARCHAR` field, refer to [​VarChar Field](https://milvus.io/docs/string.md).​

<div class="multipleCode">
  <a href="#python">Python </a>
  <a href="#java">Java</a>
  <a href="#javascript">Node.js</a>
  <a href="#curl">cURL</a>
</div>

```python
schema.add_field(​
    field_name="my_varchar",​
    datatype=DataType.VARCHAR,​
    # highlight-next-line​
    max_length=512​
)​

```

```java
schema.addField(AddFieldReq.builder()​
        .fieldName("my_varchar")​
        .dataType(DataType.VarChar)​
        // highlight-next-line​
        .maxLength(512)​
        .build());​

```

```javascript
schema.push({​
    name: "my_varchar",​
    data_type: DataType.VarChar,​
    // highlight-next-line​
    max_length: 512​
});​

```

```curl
export varCharField='{​
    "fieldName": "my_varchar",​
    "dataType": "VarChar",​
    "elementTypeParams": {​
        "max_length": 256​
    }​
}'​
​
export schema="{​
    \"autoID\": false,​
    \"fields\": [​
        $primaryField,​
        $vectorField,​
        $varCharField​
    ]​
}"​

```

### Add TEXT Fields

In Milvus 3.0 and later, you can use `TEXT` fields to store document text, passages, logs, and other long text content. Unlike `VARCHAR`, a `TEXT` field does not require `max_length`. For more on the `TEXT` field, refer to [Text Field](https://milvus.io/docs/text.md).

```python
schema.add_field(
    field_name="my_text",
    datatype=DataType.TEXT,
)
```

### Add Number Fields​

The types of numbers that Milvus supports are `Int8`, `Int16`, `Int32`, `Int64`, `Float`, and `Double`. For more on the number fields, refer to [​Number Field](https://milvus.io/docs/number.md).​

<div class="multipleCode">
  <a href="#python">Python </a>
  <a href="#java">Java</a>
  <a href="#javascript">Node.js</a>
  <a href="#curl">cURL</a>
</div>

```python
schema.add_field(​
    field_name="my_int64",​
    datatype=DataType.INT64,​
)​

```

```java
schema.addField(AddFieldReq.builder()​
        .fieldName("my_int64")​
        .dataType(DataType.Int64)​
        .build());​

```

```javascript
schema.push({​
    name: "my_int64",​
    data_type: DataType.Int64,​
});​

```

```curl
export int64Field='{​
    "fieldName": "my_int64",​
    "dataType": "Int64"​
}'​
​
export schema="{​
    \"autoID\": false,​
    \"fields\": [​
        $primaryField,​
        $vectorField,​
        $varCharField,​
        $int64Field​
    ]​
}"​

```

### Add Boolean Fields​

Milvus supports boolean fields. The following code snippets demonstrate how to add a boolean field.​

<div class="multipleCode">
  <a href="#python">Python </a>
  <a href="#java">Java</a>
  <a href="#javascript">Node.js</a>
  <a href="#curl">cURL</a>
</div>

```python
schema.add_field(​
    field_name="my_bool",​
    datatype=DataType.BOOL,​
)​

```

```java
schema.addField(AddFieldReq.builder()​
        .fieldName("my_bool")​
        .dataType(DataType.Bool)​
        .build());​

```

```javascript
schema.push({​
    name: "my_bool",​
    data_type: DataType.Boolean,​
});​

```

```curl
export boolField='{​
    "fieldName": "my_bool",​
    "dataType": "Boolean"​
}'​
​
export schema="{​
    \"autoID\": false,​
    \"fields\": [​
        $primaryField,​
        $vectorField,​
        $varCharField,​
        $int64Field,​
        $boolField​
    ]​
}"​

```

### Add JSON fields​

A JSON field usually stores half-structured JSON data. For more on the JSON fields, refer to [​JSON Field](https://milvus.io/docs/use-json-fields.md).​

<div class="multipleCode">
  <a href="#python">Python </a>
  <a href="#java">Java</a>
  <a href="#javascript">Node.js</a>
  <a href="#curl">cURL</a>
</div>

```python
schema.add_field(​
    field_name="my_json",​
    datatype=DataType.JSON,​
)​

```

```java
schema.addField(AddFieldReq.builder()​
        .fieldName("my_json")​
        .dataType(DataType.JSON)​
        .build());​

```

```javascript
schema.push({​
    name: "my_json",​
    data_type: DataType.JSON,​
});​

```

```curl
export jsonField='{​
    "fieldName": "my_json",​
    "dataType": "JSON"​
}'​
​
export schema="{​
    \"autoID\": false,​
    \"fields\": [​
        $primaryField,​
        $vectorField,​
        $varCharField,​
        $int64Field,​
        $boolField,​
        $jsonField​
    ]​
}"​

```

### Add Array Fields​

An array field stores a list of elements. The data types of all elements in an array field should be the same. For more on the array fields, refer to [​Array Field](https://milvus.io/docs/array_data_type.md).​

<div class="multipleCode">
  <a href="#python">Python </a>
  <a href="#java">Java</a>
  <a href="#javascript">Node.js</a>
  <a href="#curl">cURL</a>
</div>

```python
schema.add_field(​
    field_name="my_array",​
    datatype=DataType.ARRAY,​
    element_type=DataType.VARCHAR,​
    max_capacity=5,​
    max_length=512,​
)​

```

```java
schema.addField(AddFieldReq.builder()​
        .fieldName("my_array")​
        .dataType(DataType.Array)​
        .elementType(DataType.VarChar)​
        .maxCapacity(5)​
        .maxLength(512)​
        .build());​

```

```javascript
schema.push({​
    name: "my_array",​
    data_type: DataType.Array,​
    element_type: DataType.VarChar,​
    max_capacity: 5,​
    max_length: 512​
});​

```

```curl
export arrayField='{​
    "fieldName": "my_array",​
    "dataType": "Array",​
    "elementDataType": "VarChar",​
    "elementTypeParams": {​
        "max_length": 512​
    }​
}'​
​
export schema="{​
    \"autoID\": false,​
    \"fields\": [​
        $primaryField,​
        $vectorField,​
        $varCharField,​
        $int64Field,​
        $boolField,​
        $jsonField,​
        $arrayField​
    ]​
}"​

```

​
