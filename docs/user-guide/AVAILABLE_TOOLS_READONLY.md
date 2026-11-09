# Read-Only Tools - MCP ABAP ADT Server

Generated from code in `src/handlers/**` (not from docs).

- Level: Read-Only
- Total tools: 79

## Navigation

- [Read-Only Group](#read-only-group)
  - [Access Control](#read-only-access-control)
    - [GetAccessControl](#getaccesscontrol-read-only-access-control)
  - [Behavior Definition](#read-only-behavior-definition)
    - [ReadBehaviorDefinition](#readbehaviordefinition-read-only-behavior-definition)
  - [Behavior Implementation](#read-only-behavior-implementation)
    - [ReadBehaviorImplementation](#readbehaviorimplementation-read-only-behavior-implementation)
  - [Class](#read-only-class)
    - [GetClassMethod](#getclassmethod-read-only-class)
    - [GetClassMethods](#getclassmethods-read-only-class)
    - [ReadClass](#readclass-read-only-class)
  - [Data Element](#read-only-data-element)
    - [ReadDataElement](#readdataelement-read-only-data-element)
  - [Domain](#read-only-domain)
    - [ReadDomain](#readdomain-read-only-domain)
  - [Enhancement](#read-only-enhancement)
    - [GetEnhancementImpl](#getenhancementimpl-read-only-enhancement)
    - [GetEnhancements](#getenhancements-read-only-enhancement)
    - [GetEnhancementSpot](#getenhancementspot-read-only-enhancement)
  - [Function Group](#read-only-function-group)
    - [ReadFunctionGroup](#readfunctiongroup-read-only-function-group)
  - [Function Module](#read-only-function-module)
    - [ReadFunctionModule](#readfunctionmodule-read-only-function-module)
  - [Include](#read-only-include)
    - [GetInclude](#getinclude-read-only-include)
    - [GetIncludesList](#getincludeslist-read-only-include)
  - [Interface](#read-only-interface)
    - [ReadInterface](#readinterface-read-only-interface)
  - [Lockobject](#read-only-lockobject)
    - [GetLockObject](#getlockobject-read-only-lockobject)
  - [Messageclass](#read-only-messageclass)
    - [GetMessageClass](#getmessageclass-read-only-messageclass)
  - [Metadata Extension](#read-only-metadata-extension)
    - [ReadMetadataExtension](#readmetadataextension-read-only-metadata-extension)
  - [Package](#read-only-package)
    - [GetPackageContents](#getpackagecontents-read-only-package)
    - [ReadPackage](#readpackage-read-only-package)
  - [Program](#read-only-program)
    - [GetTextElements](#gettextelements-read-only-program)
    - [ReadProgram](#readprogram-read-only-program)
  - [Search](#read-only-search)
    - [GetObjectsByType](#getobjectsbytype-read-only-search)
    - [GetObjectsList](#getobjectslist-read-only-search)
    - [SearchObject](#searchobject-read-only-search)
  - [Service Binding](#read-only-service-binding)
    - [ReadServiceBinding](#readservicebinding-read-only-service-binding)
  - [Service Definition](#read-only-service-definition)
    - [ReadServiceDefinition](#readservicedefinition-read-only-service-definition)
  - [Structure](#read-only-structure)
    - [ReadStructure](#readstructure-read-only-structure)
  - [System](#read-only-system)
    - [DescribeByList](#describebylist-read-only-system)
    - [GetAbapAST](#getabapast-read-only-system)
    - [GetAbapDocumentation](#getabapdocumentation-read-only-system)
    - [GetAbapSemanticAnalysis](#getabapsemanticanalysis-read-only-system)
    - [GetAbapSystemSymbols](#getabapsystemsymbols-read-only-system)
    - [GetAdtTypes](#getadttypes-read-only-system)
    - [GetAtcCustomizing](#getatccustomizing-read-only-system)
    - [GetAtcWorklist](#getatcworklist-read-only-system)
    - [GetAuthorizationField](#getauthorizationfield-read-only-system)
    - [GetAuthorizationObject](#getauthorizationobject-read-only-system)
    - [GetFeatureToggle](#getfeaturetoggle-read-only-system)
    - [GetFixEdits](#getfixedits-read-only-system)
    - [GetFixProposals](#getfixproposals-read-only-system)
    - [GetInactiveObjects](#getinactiveobjects-read-only-system)
    - [GetKnowledgeTransferDoc](#getknowledgetransferdoc-read-only-system)
    - [GetObjectInfo](#getobjectinfo-read-only-system)
    - [GetObjectNodeFromCache](#getobjectnodefromcache-read-only-system)
    - [GetObjectRevisions](#getobjectrevisions-read-only-system)
    - [GetObjectStructure](#getobjectstructure-read-only-system)
    - [GetPrettyPrinterSettings](#getprettyprintersettings-read-only-system)
    - [GetSession](#getsession-read-only-system)
    - [GetSqlQuery](#getsqlquery-read-only-system)
    - [GetTransaction](#gettransaction-read-only-system)
    - [GetTypeInfo](#gettypeinfo-read-only-system)
    - [GetWhereUsed](#getwhereused-read-only-system)
    - [LintSourceLocal](#lintsourcelocal-read-only-system)
    - [PrettyPrintSource](#prettyprintsource-read-only-system)
    - [RunAtc](#runatc-read-only-system)
    - [RuntimeAnalyzeProfilerTrace](#runtimeanalyzeprofilertrace-read-only-system)
    - [RuntimeCreateProfilerTraceParameters](#runtimecreateprofilertraceparameters-read-only-system)
    - [RuntimeGetDumpById](#runtimegetdumpbyid-read-only-system)
    - [RuntimeGetGatewayErrorLog](#runtimegetgatewayerrorlog-read-only-system)
    - [RuntimeGetProfilerTraceData](#runtimegetprofilertracedata-read-only-system)
    - [RuntimeListFeeds](#runtimelistfeeds-read-only-system)
    - [RuntimeListProfilerTraceFiles](#runtimelistprofilertracefiles-read-only-system)
    - [RuntimeListSystemMessages](#runtimelistsystemmessages-read-only-system)
    - [RuntimeRunClass](#runtimerunclass-read-only-system)
    - [RuntimeRunClassWithProfiling](#runtimerunclasswithprofiling-read-only-system)
    - [RuntimeRunProgram](#runtimerunprogram-read-only-system)
    - [RuntimeRunProgramWithProfiling](#runtimerunprogramwithprofiling-read-only-system)
    - [SearchSource](#searchsource-read-only-system)
  - [Table](#read-only-table)
    - [GetTableContents](#gettablecontents-read-only-table)
    - [GetTableIndexes](#gettableindexes-read-only-table)
    - [GetTableTechnicalSettings](#gettabletechnicalsettings-read-only-table)
    - [ReadTable](#readtable-read-only-table)
  - [Translation](#read-only-translation)
    - [GetTranslation](#gettranslation-read-only-translation)
  - [Transport](#read-only-transport)
    - [GetTransport](#gettransport-read-only-transport)
    - [ListTransports](#listtransports-read-only-transport)
  - [View](#read-only-view)
    - [ReadView](#readview-read-only-view)
  - [Xslt](#read-only-xslt)
    - [GetXslt](#getxslt-read-only-xslt)

---

<a id="read-only-group"></a>
## Read-Only Group

<a id="read-only-access-control"></a>
### Read-Only / Access Control

<a id="getaccesscontrol-read-only-access-control"></a>
#### GetAccessControl (Read-Only / Access Control)
**Description:** [read-only] Operation: Read. Subject: Access Control (DCL / DCLS). Retrieve a CDS access control: its metadata (package, description, responsible, version) and the DCL role source. Works for SAP-delivered DCLs too — useful for learning the syntax of a real role definition.

**Source:** `src/handlers/access_control/readonly/handleGetAccessControl.ts`

**Parameters:**
- `access_control_name` (string, required) - DCL name (e.g., Z_MY_VIEW, C_ACCOUNTINGDOCUMENT).
- `version` (string, optional) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-behavior-definition"></a>
### Read-Only / Behavior Definition

<a id="readbehaviordefinition-read-only-behavior-definition"></a>
#### ReadBehaviorDefinition (Read-Only / Behavior Definition)
**Description:** Operation: Read, Create, Update. Subject: BehaviorDefinition. Will be useful for reading, creating, or updating behavior definition. [read-only] Read ABAP RAP behavior definition (BDEF) source code and metadata. Answers: "show behavior definition", "display BDEF source", "view RAP behavior X", "get behavior definition code". Returns source code, package, responsible, description.

**Source:** `src/handlers/behavior_definition/readonly/handleReadBehaviorDefinition.ts`

**Parameters:**
- `behavior_definition_name` (string, required) - Behavior definition name (e.g., Z_MY_BDEF).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-behavior-implementation"></a>
### Read-Only / Behavior Implementation

<a id="readbehaviorimplementation-read-only-behavior-implementation"></a>
#### ReadBehaviorImplementation (Read-Only / Behavior Implementation)
**Description:** [read-only] Read ABAP RAP behavior implementation source code and metadata. Answers: "show behavior implementation", "display behavior pool code", "view RAP implementation X". Returns source code, package, responsible, description.

**Source:** `src/handlers/behavior_implementation/readonly/handleReadBehaviorImplementation.ts`

**Parameters:**
- `behavior_implementation_name` (string, required) - Behavior implementation name (e.g., ZBP_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-class"></a>
### Read-Only / Class

<a id="getclassmethod-read-only-class"></a>
#### GetClassMethod (Read-Only / Class)
**Description:** [read-only] Read ONE method's implementation (signature line + body), not the whole class. Use GetClassMethods first to find the exact method_name. A method not found returns every method name the class has, instead of a bare error.

**Source:** `src/handlers/class/readonly/handleGetClassMethod.ts`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `method_name` (string, required) - Method name, case-insensitive. Interface-implementation methods use the ABAP form "if_x~method_name".
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="getclassmethods-read-only-class"></a>
#### GetClassMethods (Read-Only / Class)
**Description:** [read-only] List a class's methods (name, visibility, static/redefinition flags, line range, whether it has a body) WITHOUT returning the full source. Use this before UpdateClassMethod to find the exact method_name to target — avoids downloading a whole class just to locate one method.

**Source:** `src/handlers/class/readonly/handleGetClassMethods.ts`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="readclass-read-only-class"></a>
#### ReadClass (Read-Only / Class)
**Description:** Operation: Read, Create, Update. Subject: Class. Will be useful for reading, creating, or updating class. [read-only] Read ABAP class source code and metadata. Answers: "show class code", "display class source", "view class definition/implementation", "get class X". Returns source code, package, responsible, description.

**Source:** `src/handlers/class/readonly/handleReadClass.ts`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-data-element"></a>
### Read-Only / Data Element

<a id="readdataelement-read-only-data-element"></a>
#### ReadDataElement (Read-Only / Data Element)
**Description:** Operation: Read, Create, Update. Subject: DataElement. Will be useful for reading, creating, or updating data element. [read-only] Read ABAP data element definition and metadata. Answers: "show data element X", "display data element properties", "view DTEL definition", "get data element type". Returns definition, domain, package, responsible, description.

**Source:** `src/handlers/data_element/readonly/handleReadDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - Data element name (e.g., Z_MY_DATA_ELEMENT).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-domain"></a>
### Read-Only / Domain

<a id="readdomain-read-only-domain"></a>
#### ReadDomain (Read-Only / Domain)
**Description:** Operation: Read, Create, Update. Subject: Domain. Will be useful for reading, creating, or updating domain. [read-only] Read ABAP domain definition and metadata. Answers: "show domain X", "display domain fixed values", "view domain definition", "get domain properties". Returns definition, fixed values, package, responsible, description.

**Source:** `src/handlers/domain/readonly/handleReadDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., Z_MY_DOMAIN).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-enhancement"></a>
### Read-Only / Enhancement

<a id="getenhancementimpl-read-only-enhancement"></a>
#### GetEnhancementImpl (Read-Only / Enhancement)
**Description:** [read-only] Retrieve source code of a specific enhancement implementation by its name and enhancement spot.

**Source:** `src/handlers/enhancement/readonly/handleGetEnhancementImpl.ts`

**Parameters:**
- `enhancement_name` (string, required) - [read-only] Name of the enhancement implementation
- `enhancement_spot` (string, required) - Name of the enhancement spot

---

<a id="getenhancements-read-only-enhancement"></a>
#### GetEnhancements (Read-Only / Enhancement)
**Description:** [read-only] Retrieve a list of enhancements for a given ABAP object.

**Source:** `src/handlers/enhancement/readonly/handleGetEnhancements.ts`

**Parameters:**
- `object_name` (string, required) - Name of the ABAP object
- `object_type` (string, required) - [read-only] Type of the ABAP object

---

<a id="getenhancementspot-read-only-enhancement"></a>
#### GetEnhancementSpot (Read-Only / Enhancement)
**Description:** [read-only] Retrieve metadata and list of implementations for a specific enhancement spot.

**Source:** `src/handlers/enhancement/readonly/handleGetEnhancementSpot.ts`

**Parameters:**
- `enhancement_spot` (string, required) - Name of the enhancement spot

---

<a id="read-only-function-group"></a>
### Read-Only / Function Group

<a id="readfunctiongroup-read-only-function-group"></a>
#### ReadFunctionGroup (Read-Only / Function Group)
**Description:** [read-only] Read ABAP function group source code and metadata. Answers: "show function group code", "display FUGR source", "view function group X", "get function group includes". Returns source code, package, responsible, description.

**Source:** `src/handlers/function_group/readonly/handleReadFunctionGroup.ts`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., Z_MY_FG).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-function-module"></a>
### Read-Only / Function Module

<a id="readfunctionmodule-read-only-function-module"></a>
#### ReadFunctionModule (Read-Only / Function Module)
**Description:** Operation: Read, Create, Update. Subject: FunctionModule. Will be useful for reading, creating, or updating function module. [read-only] Read ABAP function module source code and metadata. Answers: "show function module code", "display FM source", "view function X", "get function module implementation". Returns source code, package, responsible, description.

**Source:** `src/handlers/function_module/readonly/handleReadFunctionModule.ts`

**Parameters:**
- `function_group_name` (string, required) - Function group name containing the function module (e.g., Z_MY_FG).
- `function_module_name` (string, required) - Function module name (e.g., Z_MY_FM).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-include"></a>
### Read-Only / Include

<a id="getinclude-read-only-include"></a>
#### GetInclude (Read-Only / Include)
**Description:** [read-only] Read ANY single ABAP include source by name, from anywhere in the repository (an include may live outside any single program tree). This is the correct tool for include names (PROG/I) — ReadProgram does not read includes.

**Source:** `src/handlers/include/readonly/handleGetInclude.ts`

**Parameters:**
- `include_name` (string, required) - Name of the ABAP Include

---

<a id="getincludeslist-read-only-include"></a>
#### GetIncludesList (Read-Only / Include)
**Description:** [read-only] Recursively discover and list ALL include files within an ABAP program or include.

**Source:** `src/handlers/include/readonly/handleGetIncludesList.ts`

**Parameters:**
- `detailed` (boolean, optional (default: false)) - [read-only] If true, returns structured JSON with metadata and raw XML.
- `object_name` (string, required) - Name of the ABAP program or include
- `object_type` (string, required) - [read-only] ADT object type of the parent. Only these four values are supported: 'PROG/P' (program), 'PROG/I' (include), 'FUGR' (function group), 'CLAS/OC' (class). Any other value is rejected by the schema.
- `timeout` (number, optional) - [read-only] Timeout in ms for each ADT request.

---

<a id="read-only-interface"></a>
### Read-Only / Interface

<a id="readinterface-read-only-interface"></a>
#### ReadInterface (Read-Only / Interface)
**Description:** Operation: Read, Create, Update. Subject: Interface. Will be useful for reading, creating, or updating interface. [read-only] Read ABAP interface source code and metadata. Answers: "show interface code", "display interface definition", "view interface X", "get interface source". Returns source code, package, responsible, description.

**Source:** `src/handlers/interface/readonly/handleReadInterface.ts`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., ZIF_MY_INTERFACE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-lockobject"></a>
### Read-Only / Lockobject

<a id="getlockobject-read-only-lockobject"></a>
#### GetLockObject (Read-Only / Lockobject)
**Description:** Operation: Read. Subject: LockObject (ENQU). Retrieve an ABAP lock object: primary table, lock mode, RFC flag, generated ENQUEUE/DEQUEUE modules.

**Source:** `src/handlers/lockobject/readonly/handleGetLockObject.ts`

**Parameters:**
- `lock_object_name` (string, required) - Lock object name (e.g., EZMY_LOCK).
- `version` (string, optional) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-messageclass"></a>
### Read-Only / Messageclass

<a id="getmessageclass-read-only-messageclass"></a>
#### GetMessageClass (Read-Only / Messageclass)
**Description:** Operation: Read. Subject: MessageClass. Retrieve an ABAP message class (MSAG) with its message numbers and short texts. Returns master_language (T100A-MASTERLANG, from adtcore:masterLanguage) — the translation baseline every text is authored in; this is NOT the response language (adtcore:language). self_explanatory is a real BOOLEAN, matching the UpdateMessageClass schema, so a read-modify-resend round trip is type-clean. A large class can exceed the tool output limit (a 109-message class is ~75 KB with the raw XML), so use from_msgno/to_msgno to page and leave include_raw_xml off. To change ONE message prefer AddMessage / UpdateMessage / DeleteMessage — they preserve the other messages server-side instead of making you resend them. Pass language to read a TRANSLATION: each message then carries translated true/false, because ADT serves the MASTER text for messages that have no row in that language.

**Notes:** Reading a translation (the language parameter). ADT falls back to the MASTER text for every message with no row in the requested language, so a read in ZH of a half-translated class returns a full set of texts and LOOKS finished. That is the read-side face of the trap that made UpdateMessage write one message at a time.  So a language read is answered from two sources: the ADT document supplies the texts (rendered in that language), and T100 supplies the truth about which messages actually HAVE a row there. Each message carries translated, and the summary carries translated_count / untranslated_count, so a partial translation is visible instead of looking done.  If the T100 read fails, the translated flags and the counts are OMITTED and a warning says why — they are never guessed from the text, because a translation that happens to equal the master text is still a translation and comparing strings would report it missing.  language is the ADT/ISO code (ZH, DE, JA); the SPRSL key it maps to is reported as language_key. Without language the class is read in the session language, which this server pins to SAP_LANGUAGE.

**Source:** `src/handlers/messageclass/readonly/handleGetMessageClass.ts`

**Parameters:**
- `from_msgno` (string, optional) - Return only messages with a number >= this (inclusive), e.g. "100". Compared as a 
- `include_raw_xml` (boolean, optional) - Include the raw ADT XML. Default FALSE — it roughly doubles the response and is the 
- `include_texts` (boolean, optional) - Include the short texts. Default true. Set false for a numbers-only listing of a 
- `language` (string, optional) - ADT/ISO code (e.g. "ZH", "DE") to read that translation. See Notes.
- `message_class_name` (string, required) - Message class name (e.g., ZMY_MSG).
- `to_msgno` (string, optional) - Return only messages with a number <= this (inclusive).
- `version` (string, optional) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-metadata-extension"></a>
### Read-Only / Metadata Extension

<a id="readmetadataextension-read-only-metadata-extension"></a>
#### ReadMetadataExtension (Read-Only / Metadata Extension)
**Description:** Operation: Read, Create, Update. Subject: MetadataExtension. Will be useful for reading, creating, or updating metadata extension. [read-only] Read ABAP metadata extension (DDLX) source code and metadata. Answers: "show metadata extension", "display DDLX source", "view UI annotations", "get metadata extension X". Returns source code, package, responsible, description.

**Source:** `src/handlers/metadata_extension/readonly/handleReadMetadataExtension.ts`

**Parameters:**
- `metadata_extension_name` (string, required) - Metadata extension name (e.g., Z_MY_DDLX).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-package"></a>
### Read-Only / Package

<a id="getpackagecontents-read-only-package"></a>
#### GetPackageContents (Read-Only / Package)
**Description:** [read-only] Retrieve objects inside an ABAP package as a flat list. Supports recursive traversal of subpackages. A package that does not exist is an ERROR, never an empty list — so [] means the package is real and empty.

**Notes:** False zero, closed. /repository/nodestructure answers with the SAME empty node set for a package that exists and is empty and for a package name that does not exist at all — measured: a guessed name and a deliberate ZZZ_NO_SUCH_PACKAGE_99 both returned [], while the real package returned 39 objects. A caller therefore could not tell "empty" from "not there", and concluding "empty" is the wrong answer that looks right.  So when the contents come back empty the package's existence is confirmed independently: GET /sap/bc/adt/packages/{name} is an exact oracle (measured 200 for an EMPTY package, 200 for a populated one, 404 for a name that is not there). Missing -> an error naming the package. Present -> [] , which now provably means empty. If the oracle itself cannot answer, that is also an error: a zero this tool cannot stand behind is the defect, not the answer.  The check costs one extra request and only runs on an empty result, so a populated package pays nothing for it.

**Source:** `src/handlers/package/readonly/handleGetPackageContents.ts`

**Parameters:**
- `include_descriptions` (boolean, optional) - Include object descriptions in response (default: true)
- `include_subpackages` (boolean, optional) - Include contents of subpackages recursively (default: false)
- `max_depth` (number, optional) - Maximum depth for recursive package traversal (default: 5)
- `package_name` (string, required) - Name of the ABAP package (e.g., "ZMY_PACKAGE")

---

<a id="readpackage-read-only-package"></a>
#### ReadPackage (Read-Only / Package)
**Description:** [read-only] Read ABAP package definition and metadata. Answers: "show package X", "display package properties", "view package contents", "get package info". Returns definition, super-package, responsible, description.

**Source:** `src/handlers/package/readonly/handleReadPackage.ts`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., Z_MY_PACKAGE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-program"></a>
### Read-Only / Program

<a id="gettextelements-read-only-program"></a>
#### GetTextElements (Read-Only / Program)
**Description:** [read-only] Read a program's text pool: text symbols (TEXT-xxx with max length), selection texts (PARAMETERS / SELECT-OPTIONS, with the Dictionary-reference flag) and list headings — in the program's ORIGINAL language. Says whether an inactive version is pending. Translations: GetTranslation (LXE type RPT4).

**Notes:** Read through /sap/bc/adt/textelements/programs/{program} and its source/symbols, source/selections, source/headings parts. version "active" (default) reads the active text pool; "inactive" reads the newest one, i.e. including changes written but not yet activated (when none are pending it is the active one, and pending_inactive_version says so). The texts are always in the program's original language (original_language) — the ADT resource serves and edits that one regardless of the logon language (measured). A parameter without a selection text is reported with missing: true.

**Source:** `src/handlers/program/readonly/handleGetTextElements.ts`

**Parameters:**
- `program_name` (string, required) - Program name.
- `version` (string, optional) - active (default) or inactive (newest, incl. pending changes).

---

<a id="readprogram-read-only-program"></a>
#### ReadProgram (Read-Only / Program)
**Description:** [read-only] Read a MAIN ABAP program (report) source code and metadata by name. Works ONLY for main programs (adtcore type PROG/P); NOT for includes — use GetInclude for include source. Include names (PROG/I) and other object types are rejected with error "invalid_object_type". Answers: "show program code", "display report source", "view program X", "get program source". Returns source code, package, responsible, description.

**Source:** `src/handlers/program/readonly/handleReadProgram.ts`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-search"></a>
### Read-Only / Search

<a id="getobjectsbytype-read-only-search"></a>
#### GetObjectsByType (Read-Only / Search)
**Description:** [read-only] Retrieves all ABAP objects of a specific type (classes, tables, programs, interfaces, etc.) under a given parent node. Useful for listing all objects of one type within a package or composite object.

**Source:** `src/handlers/search/readonly/handleGetObjectsByType.ts`

**Parameters:**
- `format` (string, optional) - [read-only] Output format: 'raw' or 'parsed'
- `node_id` (string, required) - [read-only] Node ID
- `parent_name` (string, required) - [read-only] Parent object name
- `parent_tech_name` (string, required) - [read-only] Parent technical name
- `parent_type` (string, required) - [read-only] Parent object type
- `with_short_descriptions` (boolean, optional) - [read-only] Include short descriptions

---

<a id="getobjectslist-read-only-search"></a>
#### GetObjectsList (Read-Only / Search)
**Description:** [read-only] Recursively retrieves all child ABAP repository objects for a given parent — programs (PROG), function groups (FUGR), classes (CLAS), packages (DEVC), and other composite objects — including nested includes and subcomponents.

**Source:** `src/handlers/search/readonly/handleGetObjectsList.ts`

**Parameters:**
- `parent_name` (string, required) - [read-only] Parent object name
- `parent_tech_name` (string, required) - [read-only] Parent technical name
- `parent_type` (string, required) - [read-only] Parent object type (e.g. PROG/P, FUGR)
- `with_short_descriptions` (boolean, optional (default: true))) - [read-only] Include short descriptions (default: true)

---

<a id="searchobject-read-only-search"></a>
#### SearchObject (Read-Only / Search)
**Description:** [read-only] Search ABAP repository by object name or wildcard pattern (e.g. 'ZOK*'). Answers: "find object X", "does X exist", "list objects matching...", "search for program/class/table by name". Supports all repository object types — optionally filter by type (PROG, CLAS, INTF, DEVC, TABL, DDLS, DTEL, FUGR, SRVD, SRVB, BDEF, DDLX, etc.).

**Source:** `src/handlers/search/readonly/handleSearchObject.ts`

**Parameters:**
- `maxResults` (number, optional (default: 100)) - [read-only] Maximum number of results to return
- `object_name` (string, required) - [read-only] THE SEARCH TERM — this parameter IS the query; there is no 
- `object_type` (string, optional) - [read-only] Optional ABAP object type (e.g. 'TABL', 'CLAS/OC')

---

<a id="read-only-service-binding"></a>
### Read-Only / Service Binding

<a id="readservicebinding-read-only-service-binding"></a>
#### ReadServiceBinding (Read-Only / Service Binding)
**Description:** Operation: Read, Create, Update. Subject: ServiceBinding. Will be useful for reading, creating, or updating service binding. [read-only] Read ABAP service binding (SRVB) payload and metadata. Answers: "show service binding", "display SRVB config", "view service binding X", "get OData service binding". Returns payload, package, responsible, description.

**Source:** `src/handlers/service_binding/readonly/handleReadServiceBinding.ts`

**Parameters:**
- `service_binding_name` (string, required) - Service binding name (e.g., ZUI_MY_BINDING).

---

<a id="read-only-service-definition"></a>
### Read-Only / Service Definition

<a id="readservicedefinition-read-only-service-definition"></a>
#### ReadServiceDefinition (Read-Only / Service Definition)
**Description:** Operation: Read, Create, Update. Subject: ServiceDefinition. Will be useful for reading, creating, or updating service definition. [read-only] Read ABAP service definition (SRVD) source code and metadata. Answers: "show service definition", "display SRVD source", "view service definition X", "get service exposure". Returns source code, package, responsible, description.

**Source:** `src/handlers/service_definition/readonly/handleReadServiceDefinition.ts`

**Parameters:**
- `service_definition_name` (string, required) - Service definition name (e.g., Z_MY_SRVD).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-structure"></a>
### Read-Only / Structure

<a id="readstructure-read-only-structure"></a>
#### ReadStructure (Read-Only / Structure)
**Description:** Operation: Read, Create, Update. Subject: Structure. Will be useful for reading, creating, or updating structure. [read-only] Read ABAP structure definition and metadata. Answers: "show structure fields", "display structure X", "view structure definition", "get structure components". Returns field list, package, responsible, description.

**Source:** `src/handlers/structure/readonly/handleReadStructure.ts`

**Parameters:**
- `structure_name` (string, required) - Structure name (e.g., Z_MY_STRUCTURE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-system"></a>
### Read-Only / System

<a id="describebylist-read-only-system"></a>
#### DescribeByList (Read-Only / System)
**Description:** [read-only] Batch description for a list of ABAP objects. Input: objects: Array<{ name: string, type?: string }>. Each object may be of type: PROG/P, FUGR, PROG/I, CLAS/OC, FUGR/FC, INTF/OI, TABLE, STRUCTURE, etc.

**Source:** `src/handlers/system/readonly/handleDescribeByList.ts`

**Parameters:**
- `objects` (array, required) - [read-only] Object name (required, must be valid ABAP object name or mask)

---

<a id="getabapast-read-only-system"></a>
#### GetAbapAST (Read-Only / System)
**Description:** [read-only] Parse ABAP code and return AST (Abstract Syntax Tree) in JSON format.

**Source:** `src/handlers/system/readonly/handleGetAbapAST.ts`

**Parameters:**
- `code` (string, required) - ABAP source code to parse

---

<a id="getabapdocumentation-read-only-system"></a>
#### GetAbapDocumentation (Read-Only / System)
**Description:** [read-only] Fetch ABAP keyword/element documentation for a position in source. Provide the object SOURCE uri (e.g. /sap/bc/adt/oo/classes/zcl_x/source/main), the current full source, and the line/column of the token. Returns the documentation as HTML. Does not modify anything.

**Source:** `src/handlers/system/readonly/handleGetAbapDocumentation.ts`

**Parameters:**
- `column` (number, required) - Column of the token (0-based).
- `language` (string, optional (default: EN).)) - Documentation language (default: EN).
- `line` (number, required) - Line of the token to document (1-based).
- `object_uri` (string, required) - ADT source URI of the object, e.g. /sap/bc/adt/oo/classes/zcl_foo/source/main.
- `source` (string, required) - Current full source of the object.

---

<a id="getabapsemanticanalysis-read-only-system"></a>
#### GetAbapSemanticAnalysis (Read-Only / System)
**Description:** [read-only] Perform semantic analysis on ABAP code and return symbols, types, scopes, and dependencies.

**Source:** `src/handlers/system/readonly/handleGetAbapSemanticAnalysis.ts`

**Parameters:**
- `code` (string, required) - ABAP source code to analyze

---

<a id="getabapsystemsymbols-read-only-system"></a>
#### GetAbapSystemSymbols (Read-Only / System)
**Description:** [read-only] Resolve ABAP symbols from semantic analysis with SAP system information including types, scopes, descriptions, and packages.

**Source:** `src/handlers/system/readonly/handleGetAbapSystemSymbols.ts`

**Parameters:**
- `code` (string, required) - ABAP source code to analyze and resolve symbols for

---

<a id="getadttypes-read-only-system"></a>
#### GetAdtTypes (Read-Only / System)
**Description:** [read-only] Retrieve all valid ADT object types (CLAS, TABL, PROG, DEVC, FUGR, INTF, DDLS, DTEL, DOMA, SRVD, SRVB, BDEF, DDLX, etc.) or validate a specific type name.

**Source:** `src/handlers/system/readonly/handleGetAllTypes.ts`

**Parameters:**
- `validate_type` (string, optional) - Type name to validate (optional)

---

<a id="getatccustomizing-read-only-system"></a>
#### GetAtcCustomizing (Read-Only / System)
**Description:** [read-only] Get ATC customizing: the system default check variant, ATC properties, and available exemption reasons.

**Source:** `src/handlers/system/readonly/handleGetAtcCustomizing.ts`

**Parameters:**
- None

---

<a id="getatcworklist-read-only-system"></a>
#### GetAtcWorklist (Read-Only / System)
**Description:** [read-only] Re-read the findings of an existing ATC worklist by worklist_id (returned by RunAtc) without re-running the checks. Useful to re-inspect results or include exempted findings.

**Source:** `src/handlers/system/readonly/handleGetAtcWorklist.ts`

**Parameters:**
- `include_exempted` (boolean, optional) - Include exempted findings. Default: false.
- `timestamp` (string, optional) - Optional worklist timestamp (from RunAtc worklist_timestamp) to pin the result set.
- `used_object_set` (string, optional) - Optional object-set id to filter by (e.g. the PACKAGE set id from the worklist).
- `worklist_id` (string, required) - Worklist ID returned by a previous RunAtc call.

---

<a id="getauthorizationfield-read-only-system"></a>
#### GetAuthorizationField (Read-Only / System)
**Description:** [read-only] Read one SU20 authorization field: data element, check table, domain, search help.

**Notes:** GET on /sap/bc/adt/aps/iam/auth/{field_name} (<auth:auth> XML). A bogus name answers a clean 404, so existence is unambiguous. See GetAuthorizationObject for which fields an SU21 object actually uses.

**Source:** `src/handlers/system/readonly/handleGetAuthorizationField.ts`

**Parameters:**
- `field_name` (string, required) - Authorization field name, e.g. ACTVT.

---

<a id="getauthorizationobject-read-only-system"></a>
#### GetAuthorizationObject (Read-Only / System)
**Description:** [read-only] Read one SU21 authorization object: object class, criticality, every assigned field, and every allowed activity code.

**Notes:** GET on /sap/bc/adt/aps/iam/suso/{object_name} (<suso:suso> XML). A bogus name answers HTTP 500 with the text "Object directory entry was not found" (NOT a clean 404) — matched on that exact text, since the status/exception-type pair alone is not a reliable existence signal here; a 500 with different text still propagates as a real error.

**Source:** `src/handlers/system/readonly/handleGetAuthorizationObject.ts`

**Parameters:**
- `object_name` (string, required) - Authorization object name, e.g. S_TABU_DIS.

---

<a id="getfeaturetoggle-read-only-system"></a>
#### GetFeatureToggle (Read-Only / System)
**Description:** [read-only] Read a Switch Framework feature toggle (FTGL): metadata plus rollout status/strategy and attributes.

**Notes:** Metadata comes from a GET on /sap/bc/adt/sfw/featuretoggles/{name} (a <blue:blueSource> document); rollout_status/strategy/attributes come from a second GET on that object's /source/main, which answers JSON rather than XML. A bogus name answers a clean 404 rather than an empty result, so existence is unambiguous.

**Source:** `src/handlers/system/readonly/handleGetFeatureToggle.ts`

**Parameters:**
- `toggle_name` (string, required) - Feature toggle name.

---

<a id="getfixedits-read-only-system"></a>
#### GetFixEdits (Read-Only / System)
**Description:** [read-only] Compute the concrete source edits for a quick-fix proposal from GetFixProposals, without applying them. Pass the proposal_adt_uri and user_content from GetFixProposals plus the object_uri, line, column and current source. Returns the text deltas (target object uri, range, new content) — review them and write back with the matching Update tool. Does not modify the object.

**Source:** `src/handlers/system/readonly/handleGetFixEdits.ts`

**Parameters:**
- `column` (number, required) - Column of the position (0-based).
- `line` (number, required) - Line of the position (1-based).
- `object_uri` (string, required) - ADT source URI of the object being fixed (same as passed to GetFixProposals).
- `proposal_adt_uri` (string, required) - The proposal_adt_uri from GetFixProposals (a /sap/bc/adt/quickfixes/... URI).
- `source` (string, required) - Current full source of the object.
- `user_content` (string, optional) - (optional) The opaque user_content from the chosen GetFixProposals proposal.

---

<a id="getfixproposals-read-only-system"></a>
#### GetFixProposals (Read-Only / System)
**Description:** [read-only] List available ABAP quick-fix proposals at a source position — the fixes behind an ATC finding's quickfix_info, or any editor quick-fix. Provide the object SOURCE uri (e.g. /sap/bc/adt/oo/classes/zcl_x/source/main), the current full source, and the line/column of the position. Returns proposals; pass one (proposal_adt_uri + user_content) to GetFixEdits to compute the concrete edit. Does not modify the object.

**Source:** `src/handlers/system/readonly/handleGetFixProposals.ts`

**Parameters:**
- `column` (number, required) - Column of the position (0-based).
- `line` (number, required) - Line of the position to evaluate (1-based).
- `object_uri` (string, required) - ADT source URI of the object, e.g. /sap/bc/adt/oo/classes/zcl_foo/source/main or /sap/bc/adt/programs/programs/zfoo/source/main.
- `source` (string, required) - Current full source of the object (as returned by the matching Get*/Read* tool).

---

<a id="getinactiveobjects-read-only-system"></a>
#### GetInactiveObjects (Read-Only / System)
**Description:** [read-only] Get a list of inactive ABAP objects — modified but not yet activated, pending activation. Shows classes, tables, CDS views, and other objects awaiting activation. The endpoint returns the WHOLE system’s worklist, so on a shared development system use name_prefix to ask "any of mine". total_count always reports the unfiltered total, so a filter can never make the system look cleaner than it is. Each entry includes its ADT uri, which can be passed straight to ActivateObjects.

**Source:** `src/handlers/system/readonly/handleGetInactiveObjects.ts`

**Parameters:**
- `name_prefix` (string, optional) - Keep only objects whose name starts with this prefix (case-insensitive), e.g. "ZMY". 
- `object_type` (string, optional) - Keep only objects of this ADT type. Accepts the full code ("CLAS/OC") or the 

---

<a id="getknowledgetransferdoc-read-only-system"></a>
#### GetKnowledgeTransferDoc (Read-Only / System)
**Description:** [read-only] Read a Knowledge Transfer Document (SKTD).

**Notes:** Documentation SAP attaches to a CDS entity/element (e.g. explaining a RAP business event). Documentation text is decoded from the base64 the wire sends. A bogus name answers a clean 404, so existence is unambiguous.

**Source:** `src/handlers/system/readonly/handleGetKnowledgeTransferDoc.ts`

**Parameters:**
- `document_name` (string, required) - SKTD document name.

---

<a id="getobjectinfo-read-only-system"></a>
#### GetObjectInfo (Read-Only / System)
**Description:** [read-only] Object tree (members) of a CONTAINER object: package DEVC, class CLAS, interface INTF, program PROG, function group FUGR. Members carry type, description and ADT uri. Any other type is REFUSED naming the supported list. A name that cannot be resolved is an error, never an empty tree; an object that really has no members returns CHILDREN: [] with child_count 0.

**Notes:** Mechanism, measured live on S/4HANA 2023 FPS02. POST /sap/bc/adt/repository/nodestructure is a TWO-PHASE protocol. The root request must OMIT node_id — passing node_id=0000 answers HTTP 200 with an EMPTY BODY, which is what made this tool return a success-shaped echo of its own input for every object. The root answer carries OBJECT_TYPES/SEU_ADT_OBJECT_TYPE_INFO with one NODE_ID per member type, and each NODE_ID is then fetched AGAINST THE SAME parent_type/parent_name to list that type's objects. TREE_CONTENT is empty on the root request except for a package's subpackages.  Existence. The endpoint answers HTTP 200 with a ZERO-LENGTH body for a name it cannot resolve, and a populated envelope for one it can. That is the only signal it gives, so it is what separates "does not exist" from "exists and has no members": the first is an error, the second returns CHILDREN: [] with child_count 0.  Why other types are refused. For a NON-CONTAINER parent the endpoint silently answers with that object's PACKAGE tree. Measured: DTEL/DE ZMY_DATA_ELEMENT and DEVC/K ZMY_DDIC_PKG return byte-identical documents (same 8 type groups, same NODE_IDs), as do TABL/DS ZMY_STRUCTURE and DEVC/K ZMY_API_PKG. So answering a data element would list its whole package as its members. Besides the type allow-list the handler also compares a non-package result against the parent's own package tree at runtime, so a container type not measured here fails loudly on another release instead of inventing children.  For a flat list of a package's contents prefer GetPackageContents; for one object's source outline prefer GetObjectStructure.

**Source:** `src/handlers/system/readonly/handleGetObjectInfo.ts`

**Parameters:**
- `enrich` (boolean, optional (default: true)) - Add description/package for the ROOT node via SearchObject (default true). One extra call, not one per member.
- `maxDepth` (integer, optional (default: 1)) - Depth. 1 (default) = members; 2 also expands members that are containers.
- `parent_name` (string, required) - Object name (case-insensitive).
- `parent_type` (string, required) - DEVC/K, CLAS/OC, INTF/OI, PROG/P or FUGR/F.

---

<a id="getobjectnodefromcache-read-only-system"></a>
#### GetObjectNodeFromCache (Read-Only / System)
**Description:** [read-only] Returns a node from the in-memory objects list cache by OBJECT_TYPE, OBJECT_NAME, TECH_NAME, and expands OBJECT_URI if present.

**Source:** `src/handlers/system/readonly/handleGetObjectNodeFromCache.ts`

**Parameters:**
- `object_name` (string, required) - [read-only] Object name
- `object_type` (string, required) - [read-only] Object type
- `tech_name` (string, required) - [read-only] Technical name

---

<a id="getobjectrevisions-read-only-system"></a>
#### GetObjectRevisions (Read-Only / System)
**Description:** [read-only] List the version/revision history of an ABAP object (version id, title, date, author, and each revision's content URI). Provide the object ADT uri (e.g. /sap/bc/adt/oo/classes/zcl_foo or /sap/bc/adt/programs/programs/zfoo); for a class pass include_name (main/definitions/implementations/testclasses) to select the include. Does not modify anything.

**Source:** `src/handlers/system/readonly/handleGetObjectRevisions.ts`

**Parameters:**
- `include_name` (string, optional) - (class only, optional) Include to read revisions for: main (default), definitions, implementations, testclasses.
- `object_uri` (string, required) - ADT object URI, e.g. /sap/bc/adt/oo/classes/zcl_foo or /sap/bc/adt/programs/programs/zfoo.

---

<a id="getobjectstructure-read-only-system"></a>
#### GetObjectStructure (Read-Only / System)
**Description:** [read-only] Retrieve ADT object structure as a compact JSON tree.

**Source:** `src/handlers/system/readonly/handleGetObjectStructure.ts`

**Parameters:**
- `objectname` (string, required) - ADT object name (e.g. /CBY/ACQ_DDL)
- `objecttype` (string, required) - ADT object type (e.g. DDLS/DF)

---

<a id="getprettyprintersettings-read-only-system"></a>
#### GetPrettyPrinterSettings (Read-Only / System)
**Description:** [read-only] Read the system ABAP pretty-printer settings (indentation on/off and keyword style, e.g. keywordUpper). These are the settings PrettyPrintSource applies.

**Source:** `src/handlers/system/readonly/handleGetPrettyPrinterSettings.ts`

**Parameters:**
- None

---

<a id="getsession-read-only-system"></a>
#### GetSession (Read-Only / System)
**Description:** [read-only] Get a new session ID and current session state (cookies, CSRF token) for reuse across multiple ADT operations, plus the identity of the server build answering: server_version, build_timestamp (the build actually LOADED, not the file currently on disk), started_at and pid. Call it first when recording a measurement, so the result can be attributed to a build.

**Source:** `src/handlers/system/readonly/handleGetSession.ts`

**Parameters:**
- `force_new` (boolean, optional) - Force creation of a new session even if one exists. Default: false

---

<a id="getsqlquery-read-only-system"></a>
#### GetSqlQuery (Read-Only / System)
**Description:** [read-only] Execute ABAP SQL SELECT queries on database tables and CDS views via SAP ADT Data Preview API. Use for ad-hoc data retrieval, row counts, and filtered queries. A blank cell is returned as an empty string, never as a missing row. IMPORTANT: total_rows is SAP’s own <totalRows> and is 0 unless a count was requested — branch on returned_rows, never on total_rows. Data Preview does not support JOINs and does not expose every column of every table.

**Source:** `src/handlers/system/readonly/handleGetSqlQuery.ts`

**Parameters:**
- `row_number` (number, optional (default: 100)) - [read-only] Maximum number of rows to return
- `sql_query` (string, required) - SQL query to execute. Single table only — JOINs are rejected by Data Preview.

---

<a id="gettransaction-read-only-system"></a>
#### GetTransaction (Read-Only / System)
**Description:** [read-only] Retrieve ABAP transaction (t-code) details: the program it starts (TSTC-PGMNA), the screen number (TSTC-DYPNO) and its short text (TSTCT-TTEXT). Reads the Dictionary through the ADT Data Preview, because ADT exposes no transaction resource of its own. Returns exists:false for an unknown t-code rather than failing.

**Source:** `src/handlers/system/readonly/handleGetTransaction.ts`

**Parameters:**
- `transaction_name` (string, required) - Transaction code (e.g., SE11, VA01). Case-insensitive.

---

<a id="gettypeinfo-read-only-system"></a>
#### GetTypeInfo (Read-Only / System)
**Description:** [read-only] Retrieve ABAP type information for domains (DOMA), data elements (DTEL), table types, and structures. Returns field definitions, value ranges, fixed values, and DDIC metadata.

**Source:** `src/handlers/system/readonly/handleGetTypeInfo.ts`

**Parameters:**
- `include_structure_fallback` (boolean, optional (default: true)) - When true (default), tries DDIC structure lookup only if type lookup returns 404/empty.
- `type_name` (string, required) - Name of the ABAP type

---

<a id="getwhereused-read-only-system"></a>
#### GetWhereUsed (Read-Only / System)
**Description:** [read-only] Search where-used references — find all objects that reference or depend on a given ABAP object. Answers: "where is X used", "who calls X", "what depends on X", "show usages of X". Returns referencing objects with types and packages. Covers classes, interfaces, programs, includes, function groups/modules, packages, tables, structures, TABLE TYPES, domains, data elements, CDS views, classic views, service definitions/bindings, behavior definitions, metadata extensions, message classes, lock objects and transformations. Types not in that list are rejected with the supported list; for the types SAP itself cannot answer for, the error comes from SAP.

**Source:** `src/handlers/system/readonly/handleGetWhereUsed.ts`

**Parameters:**
- `enable_all_types` (boolean, optional (default: false)) - If true, expands the scope to all available object types (Eclipse 'select all' behavior) by flipping every isSelected flag in the scope XML. Default: false (SAP default scope). Note: on large systems this can make the search significantly slower.
- `object_name` (string, required) - Name of the ABAP object. For function modules the name MUST be in the form 'GROUP|FM_NAME' (function group name, pipe, function module name).
- `object_type` (string, required) - Type of the ABAP object. Case-insensitive; either a human alias or an ADT type code. 'class'/'clas/oc', 'interface'/'intf/if', 'program'/'prog/p', 'include', 'function'/'functiongroup'/'fugr', 'functionmodule'/'function_module'/'fugr/ff' (object_name must be 'GROUP|FM_NAME'), 'package'/'devc/k', 'table'/'tabl/dt', 'structure'/'stru/dt', 'table_type'/'tabletype'/'ttyp'/'ttyp/da', 'domain'/'doma/dd', 'data_element'/'dtel', 'view'/'cds_view'/'ddls/df' (CDS DDL source), 'classic_view'/'view/dv', 'service_definition'/'srvd', 'service_binding'/'srvb', 'behavior_definition'/'bdef', 'metadata_extension'/'ddlx', 'message_class'/'msag', 'lock_object'/'enqu', 'xslt'/'transformation'. An unknown value throws an error listing the supported types.

---

<a id="lintsourcelocal-read-only-system"></a>
#### LintSourceLocal (Read-Only / System)
**Description:** [read-only, offline] Static ABAP analysis via abaplint — no SAP call, works on a fragment before anything is created. Complements Check*/Update*, which require the object to already exist on SAP.

**Notes:** abaplint's own default severities are used unfiltered (150+ rules) except "description_empty", which is always excluded — it fires because this tool never supplies a companion class-XML sidecar, not because of anything in the submitted source. A caller who finds another rule noisy for their case can pass it in exclude_rules. release accepts "757".."758" or "cloud"/"btp"; an unrecognised value falls back to 758 rather than erroring, and the response says so. With auto_fix:true, abaplint's own quick-fixes are applied in a bounded loop (re-parsing between each, since a fix can shift line numbers) and the response returns fixed_source plus whatever could not be auto-fixed — never a partial/half-applied source.

**Source:** `src/handlers/system/readonly/handleLintSourceLocal.ts`

**Parameters:**
- `auto_fix` (boolean, optional) - Apply auto-fixes and return fixed_source. DEFAULT: false.
- `exclude_rules` (array, optional) - Rule keys to omit from the result.
- `max_issues` (number, optional (default: MAX_ISSUES_DEFAULT)) - 
- `object_name` (string, required) - Object name (used only to build the filename).
- `object_type` (string, required) - Sets which file extension is used (not sniffed).
- `release` (string, optional (default: 758)) - SAP_BASIS release, or "cloud". DEFAULT: "758".
- `source_code` (string, required) - ABAP or CDS source to analyse.

---

<a id="prettyprintsource-read-only-system"></a>
#### PrettyPrintSource (Read-Only / System)
**Description:** [read-only] Format ABAP source code using the system pretty printer (indentation + keyword case per the system settings). Pass the raw source; returns the formatted source. Useful to normalize generated code before Update*/activation. Does not modify any repository object.

**Source:** `src/handlers/system/readonly/handlePrettyPrintSource.ts`

**Parameters:**
- `source` (string, required) - ABAP source code to format.

---

<a id="runatc-read-only-system"></a>
#### RunAtc (Read-Only / System)
**Description:** [analysis] Run ABAP Test Cockpit (ATC) checks on one or more objects/packages in a single run and return the findings (priority, check, message, location, quickfix info). Does not modify any checked object. Provide object_uri(s), or object_name + object_type, or an objects array. If check_variant is omitted, the system default ATC variant is used. Returns worklist_id — pass it to GetAtcWorklist to re-read findings later without re-running. objects_checked can be 0 for objects ATC does not cover: objects_not_checked names them with a reason, and the message then says the run is NOT a clean result. Correlate requested against checked by NAME — the worklist reports .../atc/objects/R3TR/<TYPE>/<NAME>, never the URI you passed, so a URI comparison matches nothing.

**Notes:** A PACKAGE RUN IS NOT A STATEMENT ABOUT THE PACKAGE. It expands into its members and examines only the types the variant covers, so "N object(s)" reads as coverage when it is a fraction. Measured by a reporting project: 2 of 74 objects checked in one package, 7 of ~128 in another — and a handover that had said "priority 2 = 0" for weeks, covering six DCL access controls ATC had never opened. objects_checked_by_type names what was actually examined, and the summary sentence says plainly that everything else in the package was not looked at. Do NOT infer a fixed "covered types" list from any one run: their runs saw CLAS, INTF, PROG, TABL and BDEF examined, while a run here over a package holding active interfaces, tables and behaviour definitions came back CLAS only. For a definitive requested-vs-present comparison on a package, read its contents with GetPackageContents and compare against objects[].  WHAT WAS CHECKED IS REPORTED SEPARATELY FROM WHAT WAS FOUND, and the difference matters. objects_requested vs objects_checked, plus objects_not_checked [{name, uri, reason}] for anything asked for that produced no worklist entry. Measured: a data element, three CDS views and a large projection view each came back objects_checked 0 with an empty object list — ATC simply does not check those types under this system's variant. "No findings" is a claim about quality, so the summary sentence never makes it when nothing was examined; it says the run is NOT a clean result.  ADT SUPPLIES NO REASON, so the reason is established here. Measured: a data element that EXISTS and one that NEVER EXISTED produce byte-identical runs — same objects_checked 0, same empty list, the same single FINDING_STATS "0,0,0". So each unchecked object is read back once: a 404 means the name or type is wrong (a caller error worth failing on), anything else means the object is there and its type is not covered. That read runs ONLY for objects that were not checked, so a normal run pays nothing for it.  object_set_is_complete is SAP's own flag and is passed through, but do NOT read it as "everything was checked": it came back true on a run that checked nothing.  Requested and checked are matched by NAME. The worklist reports an object as /sap/bc/adt/atc/objects/R3TR/CLAS/<NAME>, which never equals the URI a caller passes. A package is expected to expand into its members, so it counts as unchecked only when the expansion yields nothing.  check_variant is verified against SCICHKV_HD before the run and an unknown name is REFUSED. ADT accepts any variant name with HTTP 200 and silently falls back to the system default, so a typo would otherwise produce findings for the wrong variant — including a misleading "no findings". A variant that exists but is USER-SCOPED (SCICHKV_HD-CIUSER non-blank) still runs, and the response sets check_variant_user_scoped:true plus a warning naming the owner: findings identical to a DEFAULT run over the same objects are the signal that the endpoint ignored it. ADT does not report which variant a run actually used, so the response echoes check_variant_requested plus check_variant_verified and there is deliberately no "effective variant" field — such a field could only be filled from the request, which is an echo wearing a verdict's name.  Findings are capped at a 60 KB budget, reported through findings_truncated / findings_shown / findings_omitted. No severity class is dropped: priority 3 is not noise, and a default that hides a whole class is the same defect pointed at the caller.

**Source:** `src/handlers/system/readonly/handleRunAtc.ts`

**Parameters:**
- `check_variant` (string, optional) - ATC check variant name. Default: the system default from ATC customizing. 
- `include_exempted` (boolean, optional) - Include exempted findings. Default: false.
- `max_priority` (number, optional) - Return only findings of this ATC priority or LOWER-numbered (i.e. more severe). 
- `max_results` (number, optional) - Maximum number of findings to return. Default: 100.
- `object_name` (string, optional) - Name of a single object or package to check (e.g. YMFGR001 or YI_MFGR001_001). Used together with object_type.
- `object_type` (string, optional) - Type of the object referenced by object_name. "view" = CDS view (DDLS), "package" checks all objects in the package.
- `object_uri` (string, optional) - Single full ADT object URI (same as a 1-element object_uris).
- `object_uris` (array, optional) - Full ADT object URIs (e.g. /sap/bc/adt/ddic/ddl/sources/yi_mfgr001_001). Overrides name/type inputs when provided.
- `objects` (array, optional) - Multiple objects to check in ONE ATC run. Each item: {object_name, object_type}.
- `summary` (boolean, optional) - Return counts only, without the findings array. Default false. 

---

<a id="runtimeanalyzeprofilertrace-read-only-system"></a>
#### RuntimeAnalyzeProfilerTrace (Read-Only / System)
**Description:** [runtime] Read profiler trace view and return compact analysis summary (totals + top entries).

**Source:** `src/handlers/system/readonly/handleRuntimeAnalyzeProfilerTrace.ts`

**Parameters:**
- `top` (number, optional) - Number of top rows for summary. Default: 10.
- `trace_id_or_uri` (string, required) - Profiler trace ID or full trace URI.
- `view` (string, optional (default: hitlist)) - 
- `with_system_events` (boolean, optional) - Include system events.

---

<a id="runtimecreateprofilertraceparameters-read-only-system"></a>
#### RuntimeCreateProfilerTraceParameters (Read-Only / System)
**Description:** [runtime] Create ABAP profiler trace parameters and return profilerId (URI) for profiled execution.

**Source:** `src/handlers/system/readonly/handleRuntimeCreateProfilerTraceParameters.ts`

**Parameters:**
- `aggregate` (boolean, optional) - 
- `all_db_events` (boolean, optional) - 
- `all_dynpro_events` (boolean, optional) - 
- `all_internal_table_events` (boolean, optional) - 
- `all_misc_abap_statements` (boolean, optional) - 
- `all_procedural_units` (boolean, optional) - 
- `all_system_kernel_events` (boolean, optional) - 
- `amdp_trace` (boolean, optional) - 
- `description` (string, required) - Human-readable trace description.
- `explicit_on_off` (boolean, optional) - 
- `max_size_for_trace_file` (number, optional) - 
- `max_time_for_tracing` (number, optional) - 
- `sql_trace` (boolean, optional) - 
- `with_rfc_tracing` (boolean, optional) - 

---

<a id="runtimegetdumpbyid-read-only-system"></a>
#### RuntimeGetDumpById (Read-Only / System)
**Description:** [runtime] Read one ABAP runtime dump. Accepts the id RuntimeListFeeds returns verbatim. Use chapters to get just the sections that explain the dump instead of the whole ~120 KB text.

**Notes:** Takes the RuntimeListFeeds id AS-IS: that id is the full ADT path (/sap/bc/adt/vit/runtime/dumps/{id}) while the readable resource is a DIFFERENT path (/sap/bc/adt/runtime/dump/{id}), so the prefix is stripped here rather than rejected. An absolute URL, the document's own self link, and a /formatted|/summary|/unformatted suffix are all accepted too.  summary is built from the dump's own shape, so it always names error (the exception class) and terminated_program, plus available_chapters — the list of what chapters can ask for.  chapters cuts named sections out of the formatted text (two reads: metadata + text). Select them language-independently: ${Object.keys(CHAPTER_ALIASES).join(', ')}, or a raw chapter name (kap0, kap3, …) or category ("ABAP Developer View"). A chapter's TITLE is in the language the dump was recorded in — a ZH dump has no chapter called "Error analysis" — so titles work but are not portable. Selectors that match nothing come back in chapters_not_matched, so an empty result is never read as "that chapter is empty".  view=formatted returns the whole SAPGUI-style text (~120 KB on a real dump) and is rarely what you want; chapters is the middle option between it and summary.

**Source:** `src/handlers/system/readonly/handleRuntimeGetDumpById.ts`

**Parameters:**
- `chapters` (array, optional) - Return only these chapters of the dump text, e.g. ["what_happened","error_analysis"]. See notes for selectors.
- `dump_id` (string, required) - Dump ID, exactly as RuntimeListFeeds returns it (full ADT path accepted).
- `response_mode` (string, optional (default: both)) - "summary" — key facts only, "payload" — full parsed dump, "both".
- `view` (string, optional (default: default)) - Payload to read: default (XML), summary (HTML), formatted (full long text).

---

<a id="runtimegetgatewayerrorlog-read-only-system"></a>
#### RuntimeGetGatewayErrorLog (Read-Only / System)
**Description:** [runtime] List SAP Gateway error log (/IWFND/ERROR_LOG) or get error detail. Returns structured entries with type, shortText, transactionId, dateTime, username. With error_url returns full detail including serviceInfo, errorContext, sourceCode, callStack.

**Source:** `src/handlers/system/readonly/handleRuntimeGetGatewayErrorLog.ts`

**Parameters:**
- `error_url` (string, optional) - Feed URL of a specific error entry (from a previous list response link field). When provided, returns detailed error info instead of listing.
- `from` (string, optional) - Start of time range in YYYYMMDDHHMMSS format.
- `max_results` (number, optional) - Maximum number of errors to return.
- `to` (string, optional) - End of time range in YYYYMMDDHHMMSS format.
- `user` (string, optional) - Filter errors by SAP username.

---

<a id="runtimegetprofilertracedata-read-only-system"></a>
#### RuntimeGetProfilerTraceData (Read-Only / System)
**Description:** [runtime] Read profiler trace data by trace id/uri: hitlist, statements, or db accesses. Returns parsed JSON payload.

**Source:** `src/handlers/system/readonly/handleRuntimeGetProfilerTraceData.ts`

**Parameters:**
- `auto_drill_down_threshold` (number, optional) - Auto drill-down threshold (for statements view).
- `id` (number, optional) - Statement node ID (for statements view).
- `trace_id_or_uri` (string, required) - Profiler trace ID or full ADT trace URI.
- `view` (string, required) - Trace view to retrieve.
- `with_details` (boolean, optional) - Include statement details (for statements view).
- `with_system_events` (boolean, optional) - Include system events.

---

<a id="runtimelistfeeds-read-only-system"></a>
#### RuntimeListFeeds (Read-Only / System)
**Description:** [runtime] List available ADT runtime feeds or read a specific feed type. Feed types: dumps, system_messages, gateway_errors. Without feed_type returns available feed descriptors.

**Source:** `src/handlers/system/readonly/handleRuntimeListFeeds.ts`

**Parameters:**
- `feed_type` (string, optional (default: descriptors)) - Feed to read. "descriptors" lists available feeds, "variants" lists feed variants, others read that specific feed. Default: descriptors.
- `from` (string, optional) - Start of time range in YYYYMMDDHHMMSS format.
- `max_results` (number, optional) - Maximum number of entries to return.
- `to` (string, optional) - End of time range in YYYYMMDDHHMMSS format.
- `user` (string, optional) - Filter feed entries by SAP username.

---

<a id="runtimelistprofilertracefiles-read-only-system"></a>
#### RuntimeListProfilerTraceFiles (Read-Only / System)
**Description:** [runtime] List ABAP profiler trace files available in ADT runtime. Returns parsed JSON payload.

**Source:** `src/handlers/system/readonly/handleRuntimeListProfilerTraceFiles.ts`

**Parameters:**
- None

---

<a id="runtimelistsystemmessages-read-only-system"></a>
#### RuntimeListSystemMessages (Read-Only / System)
**Description:** [runtime] List SM02 system messages. Returns structured entries with id, title, text, severity, validity period, and author.

**Source:** `src/handlers/system/readonly/handleRuntimeListSystemMessages.ts`

**Parameters:**
- `from` (string, optional) - Start of time range in YYYYMMDDHHMMSS format.
- `max_results` (number, optional) - Maximum number of messages to return.
- `to` (string, optional) - End of time range in YYYYMMDDHHMMSS format.
- `user` (string, optional) - Filter by author username.

---

<a id="runtimerunclass-read-only-system"></a>
#### RuntimeRunClass (Read-Only / System)
**Description:** [runtime] Execute an ABAP class implementing if_oo_adt_classrun and return its output. Set profile=true to also capture a profiler trace (returns profilerId/traceId alongside output).

**Source:** `src/handlers/system/readonly/handleRuntimeRunClass.ts`

**Parameters:**
- `aggregate` (boolean, optional) - 
- `all_db_events` (boolean, optional) - 
- `all_dynpro_events` (boolean, optional) - 
- `all_internal_table_events` (boolean, optional) - 
- `all_misc_abap_statements` (boolean, optional) - 
- `all_procedural_units` (boolean, optional) - 
- `all_system_kernel_events` (boolean, optional) - 
- `amdp_trace` (boolean, optional) - 
- `class_name` (string, required) - ABAP class name to execute.
- `description` (string, optional) - Profiler trace description (only used when profile=true).
- `explicit_on_off` (boolean, optional) - 
- `max_size_for_trace_file` (number, optional) - 
- `max_time_for_tracing` (number, optional) - 
- `max_trace_attempts` (integer, optional) - Max polling attempts to resolve traceId after execution (default 5). Only used when profile=true.
- `profile` (boolean, optional) - When true, run with the profiler and resolve the resulting traceId. Default false.
- `sql_trace` (boolean, optional) - 
- `trace_lookup_uris` (array, optional) - Additional URIs to consult when resolving the trace (advanced, profile=true).
- `trace_retry_delay_ms` (integer, optional) - Delay in ms between trace polling attempts (default 2000). Only used when profile=true.
- `with_rfc_tracing` (boolean, optional) - 

---

<a id="runtimerunclasswithprofiling-read-only-system"></a>
#### RuntimeRunClassWithProfiling (Read-Only / System)
**Description:** [runtime][deprecated] Execute ABAP class with profiler enabled and return created profilerId + traceId. Prefer RuntimeRunClass with profile=true; this tool is kept for backward compatibility and will be removed in a future major release.

**Source:** `src/handlers/system/readonly/handleRuntimeRunClassWithProfiling.ts`

**Parameters:**
- `aggregate` (boolean, optional) - 
- `all_db_events` (boolean, optional) - 
- `all_dynpro_events` (boolean, optional) - 
- `all_internal_table_events` (boolean, optional) - 
- `all_misc_abap_statements` (boolean, optional) - 
- `all_procedural_units` (boolean, optional) - 
- `all_system_kernel_events` (boolean, optional) - 
- `amdp_trace` (boolean, optional) - 
- `class_name` (string, required) - ABAP class name to execute.
- `description` (string, optional) - Profiler trace description.
- `explicit_on_off` (boolean, optional) - 
- `max_size_for_trace_file` (number, optional) - 
- `max_time_for_tracing` (number, optional) - 
- `max_trace_attempts` (integer, optional) - Max polling attempts to resolve traceId after execution (default 5). Increase for slow systems (e.g. SAP trial cloud).
- `sql_trace` (boolean, optional) - 
- `trace_lookup_uris` (array, optional) - Additional URIs to consult when resolving the trace (advanced).
- `trace_retry_delay_ms` (integer, optional) - Delay in ms between trace polling attempts (default 2000).
- `with_rfc_tracing` (boolean, optional) - 

---

<a id="runtimerunprogram-read-only-system"></a>
#### RuntimeRunProgram (Read-Only / System)
**Description:** [runtime] Execute an ABAP program (report) and return its output. Set profile=true to also start a profiler trace; use RuntimeListProfilerTraceFiles afterwards to locate the trace (program execution is fire-and-forget, so traceId is not returned synchronously).

**Notes:** SELECTION-SCREEN PARAMETERS ARE NOT SUPPORTED, and that is the endpoint's limit, not an omission here. Measured on S/4HANA 2023 FPS02:    - Discovery advertises exactly one query parameter:     /sap/bc/adt/programs/programrun/{programname}{?profilerId}. There is no     parameter, select-option or variant in the template.   - An unknown query parameter is not ignored on the synchronous endpoint — it     answers HTTP 500 with an ICF error page.   - The background variant, POST /programs/programrun/job/{programname}, DOES run     the report (verified: a job appears in TBTCO and reaches status F). But it     accepts a nonexistent variant, ?variant=ZZ_NO_SUCH_VARIANT, with HTTP 200 and     an empty body, and ignores a selection body the same way. It validates only     the program name (a wrong one is a 404). So a variant passed there is     SILENTLY DISCARDED and the report runs with its default selection values.  A `parameters` / `select_options` / `variant` argument is therefore deliberately NOT offered: it could only ever be an argument that looks accepted and does nothing.  WHAT TO DO INSTEAD (contributed by a reporting project that runs a parameterised report writing to the live Dictionary). Wrap it:      REPORT zmy_tmp_apply.     SUBMIT zmy_real_report WITH p_commit = abap_true                            WITH p_dtel   = abap_true                            AND RETURN.  then RuntimeRunProgram the wrapper and DeleteProgram it. Two cautions, neither obvious, both worth the line:    - Put the wrapper in $TMP. No transport, and no TADIR entry to clean out of a     customer package afterwards — otherwise removing it needs a deletion marker     transported.   - Do NOT flip the real report's own DEFAULT values instead. That is the     tempting one-liner, and it leaves a report that writes to the live     Dictionary the moment anyone runs it with no arguments.  The program runs with its DEFAULT selection-screen values. A report with a MANDATORY parameter will therefore fail; the ICF error page it produces is reduced to its message by describeSapErrorPage.

**Source:** `src/handlers/system/readonly/handleRuntimeRunProgram.ts`

**Parameters:**
- `aggregate` (boolean, optional) - 
- `all_db_events` (boolean, optional) - 
- `all_dynpro_events` (boolean, optional) - 
- `all_internal_table_events` (boolean, optional) - 
- `all_misc_abap_statements` (boolean, optional) - 
- `all_procedural_units` (boolean, optional) - 
- `all_system_kernel_events` (boolean, optional) - 
- `amdp_trace` (boolean, optional) - 
- `description` (string, optional) - Profiler trace description (only used when profile=true).
- `explicit_on_off` (boolean, optional) - 
- `max_size_for_trace_file` (number, optional) - 
- `max_time_for_tracing` (number, optional) - 
- `profile` (boolean, optional) - When true, run with the profiler. Default false. Trace must be located afterwards via RuntimeListProfilerTraceFiles — program execution does not return traceId synchronously.
- `program_name` (string, required) - ABAP program name to execute.
- `sql_trace` (boolean, optional) - 
- `with_rfc_tracing` (boolean, optional) - 

---

<a id="runtimerunprogramwithprofiling-read-only-system"></a>
#### RuntimeRunProgramWithProfiling (Read-Only / System)
**Description:** [runtime][deprecated] Execute ABAP program with profiler enabled and return created profilerId. Prefer RuntimeRunProgram with profile=true; this tool is kept for backward compatibility and will be removed in a future major release.

**Notes:** SELECTION-SCREEN PARAMETERS ARE NOT SUPPORTED, and that is the endpoint's limit, not an omission here. Measured on S/4HANA 2023 FPS02:    - Discovery advertises exactly one query parameter:     /sap/bc/adt/programs/programrun/{programname}{?profilerId}. There is no     parameter, select-option or variant in the template.   - An unknown query parameter is not ignored on the synchronous endpoint — it     answers HTTP 500 with an ICF error page.   - The background variant, POST /programs/programrun/job/{programname}, DOES run     the report (verified: a job appears in TBTCO and reaches status F). But it     accepts a nonexistent variant, ?variant=ZZ_NO_SUCH_VARIANT, with HTTP 200 and     an empty body, and ignores a selection body the same way. It validates only     the program name (a wrong one is a 404). So a variant passed there is     SILENTLY DISCARDED and the report runs with its default selection values.  A `parameters` / `select_options` / `variant` argument is therefore deliberately NOT offered: it could only ever be an argument that looks accepted and does nothing.  WHAT TO DO INSTEAD (contributed by a reporting project that runs a parameterised report writing to the live Dictionary). Wrap it:      REPORT zmy_tmp_apply.     SUBMIT zmy_real_report WITH p_commit = abap_true                            WITH p_dtel   = abap_true                            AND RETURN.  then RuntimeRunProgram the wrapper and DeleteProgram it. Two cautions, neither obvious, both worth the line:    - Put the wrapper in $TMP. No transport, and no TADIR entry to clean out of a     customer package afterwards — otherwise removing it needs a deletion marker     transported.   - Do NOT flip the real report's own DEFAULT values instead. That is the     tempting one-liner, and it leaves a report that writes to the live     Dictionary the moment anyone runs it with no arguments.  The program runs with its DEFAULT selection-screen values. A report with a MANDATORY parameter will therefore fail; the ICF error page it produces is reduced to its message by describeSapErrorPage.

**Source:** `src/handlers/system/readonly/handleRuntimeRunProgramWithProfiling.ts`

**Parameters:**
- `aggregate` (boolean, optional) - 
- `all_db_events` (boolean, optional) - 
- `all_dynpro_events` (boolean, optional) - 
- `all_internal_table_events` (boolean, optional) - 
- `all_misc_abap_statements` (boolean, optional) - 
- `all_procedural_units` (boolean, optional) - 
- `all_system_kernel_events` (boolean, optional) - 
- `amdp_trace` (boolean, optional) - 
- `description` (string, optional) - Profiler trace description.
- `explicit_on_off` (boolean, optional) - 
- `max_size_for_trace_file` (number, optional) - 
- `max_time_for_tracing` (number, optional) - 
- `program_name` (string, required) - ABAP program name to execute.
- `sql_trace` (boolean, optional) - 
- `with_rfc_tracing` (boolean, optional) - 

---

<a id="searchsource-read-only-system"></a>
#### SearchSource (Read-Only / System)
**Description:** [read-only] Scan ABAP source text inside one or more PACKAGES (programs, function groups, classes). Onprem-only. ⚠️ This is a SCANNER, not a retriever — if you already know the object name, use GetProgram / GetClass / GetInclude / GetFunctionModule / GetStructure / GetTable instead; they are orders of magnitude faster. Narrowing `packages` is the only thing that makes a scan fast. Run ONE SearchSource per destination at a time. See Notes for masks, truncation flags and version behaviour.

**Notes:** packages accepts * masks (Z*, ZFI_*, /NS/Z*) alongside exact names, but mask resolution is best-effort and scoped to the ADT repository-search result window — there is no guarantee every matching package is scanned. If you need certainty, pass concrete package names. `packages` is PACKAGE names (DEVC), not object names; passing * enumerates the whole repository and can take minutes. object_filter is applied AFTER enumeration, so it does not reduce scan cost.  Comments are searched by default; exclude_comments=true drops col-1 * and full-line " comments. The version parameter affects PROG and CLAS main-include reads only — FUGR subinclude reads always go against the active version, because the include endpoint exposes no version selector.  truncated.by_object_cap means at least one object had MORE hits than max_hits_per_object, so that object's hits were capped. It is NOT a limit on the number of objects scanned — that is max_objects, which sets truncated.by_max_objects. To avoid by_object_cap, raise max_hits_per_object.  COVERAGE (I-23). A class is scanned as FIVE source units: source/main plus the CCDEF / CCIMP / CCAU / CCMAC includes, which source/main does NOT contain. Measured on S/4HANA 2023 FPS02: a RAP behavior pool's source/main is a 7-line skeleton while its CCIMP holds the 89 lines of actual handler logic, and a class with 227 lines in main had 394 more in its testclasses include. Scanning main alone therefore answers "no hits" for code it never opened. Hits name the unit they came from, e.g. "ZCL_X (CCIMP)". class_includes=false restores the old main-only behaviour when speed matters more than coverage.  scanned.source_lines is the honest coverage figure — judge a zero-hit result by it, not by scanned.objects. read_failures lists units that could not be read at all; a failed read yields no hits and would otherwise be indistinguishable from "no match".  concurrency is capped at 16 per call. Multiple parallel SearchSource calls against one SAP system saturate the scan backend and can make all of them time out; prefer combining terms into a single call.

**Source:** `src/handlers/system/readonly/handleSearchSource.ts`

**Parameters:**
- `class_includes` (boolean, optional) - Also scan a class's CCDEF/CCIMP/CCAU/CCMAC includes (default true). source/main does NOT contain them. Set false only to trade coverage for speed — it costs 4 reads per class.
- `concurrency` (number, optional) - Parallel source fetches (default 8, max 16).
- `emit_no_hits` (boolean, optional) - When true, list zero-hit targets in a separate no_hits array. Default false.
- `exclude` (array, optional) - Up to 3 substrings; a line containing any of them is dropped.
- `exclude_comments` (boolean, optional) - Skip col-1 '*' and full-line '"' comment lines. Default false (comments are scanned).
- `hits_only` (boolean, optional) - Return the compact shape {object, include, line, text} instead of the full hit. Default false.
- `include_subpackages` (boolean, optional) - Recurse into subpackages (default true).
- `max_bytes` (number, optional) - Cap the serialized size of results. Whole hits are dropped from the end; truncated.by_max_bytes and results_omitted report what was cut.
- `max_hits_per_object` (number, optional) - Cap hits per root object across its source units (default 100). When exceeded, truncated.by_object_cap=true is set. Raise this value if you need more hits per object.
- `max_objects` (number, optional) - Cap the total objects scanned across all packages (default 500). Setting truncated.by_max_objects=true when exceeded.
- `object_filter` (string, optional) - Glob applied to object names within each package (e.g. "Z*").
- `object_types` (array, optional) - Subset of object families to scan (default: all three).
- `packages` (array, required) - Packages to scan. Each entry is either an exact dev-class name or a `*` mask (* = any chars). Examples: "ZFI_OBSOLETE", "Z*", "ZFI_*", "/NS/Z*". These are package (DEVC) names, not object names.
- `query` (string, required) - Primary substring to match (case-insensitive, ABAP CS).
- `query2` (string, optional) - Optional second substring. When set, both query and query2 must appear on the same line.
- `time_budget_ms` (number, optional) - Internal scan deadline in ms. When exceeded, returns hits gathered so far with truncated.by_timeout=true. Set this BELOW your client/transport timeout (e.g. 540000 for a 600s client) so you get a partial result instead of a hard cutoff.
- `version` (enum, optional) - Source version for PROG and CLAS main include reads. Default active. FUGR subincludes always read the active version.

---

<a id="read-only-table"></a>
### Read-Only / Table

<a id="gettablecontents-read-only-table"></a>
#### GetTableContents (Read-Only / Table)
**Description:** [read-only] Retrieve contents (data preview) of an ABAP database table or CDS view. Returns rows of data like SE16/SE16N. A blank cell is returned as an empty string, never as a missing row. The result is trimmed to max_rows and has_more:true is set when SAP indicated more rows exist. IMPORTANT: total_rows is SAP’s own <totalRows> and is 0 unless a count was requested — branch on returned_rows, never on total_rows.

**Source:** `src/handlers/table/readonly/handleGetTableContents.ts`

**Parameters:**
- `max_rows` (number, optional) - Maximum number of rows to retrieve (default 100)
- `table_name` (string, required) - Name of the ABAP table

---

<a id="gettableindexes-read-only-table"></a>
#### GetTableIndexes (Read-Only / Table)
**Description:** [read-only] Operation: Read. Subject: Table secondary indexes (SE11, DDIC type TABL/DTI). List every secondary index of a table with its field list, uniqueness flag and buffer-only flag. Use this to VERIFY that an index was really created — DD12L cannot be read through the Data Preview, so this is the only way to see a table’s indexes. Note primary keys are not indexes and are not listed here.

**Source:** `src/handlers/table/readonly/handleGetTableIndexes.ts`

**Parameters:**
- `include_fields` (boolean, optional) - Read each index’s field list (one extra request per index). Default true; 
- `table_name` (string, required) - Table name (e.g., ZMY_TABLE).

---

<a id="gettabletechnicalsettings-read-only-table"></a>
#### GetTableTechnicalSettings (Read-Only / Table)
**Description:** [read-only] Operation: Read. Subject: Table technical settings (SE13). Report a table’s buffering mode, size category, data class and change-logging flag. Buffering is encoded by SAP as two fields, so "allowed" alone does NOT mean the table is buffered — the response states the effective mode in plain words and gives the DD09L-PUFFERUNG value it corresponds to for an independent check.

**Source:** `src/handlers/table/readonly/handleGetTableTechnicalSettings.ts`

**Parameters:**
- `table_name` (string, required) - Table name (e.g., ZMY_TABLE).
- `version` (string, optional) - Version to read: "active" (default) or "inactive".

---

<a id="readtable-read-only-table"></a>
#### ReadTable (Read-Only / Table)
**Description:** Operation: Read, Create, Update. Subject: Table. Will be useful for reading, creating, or updating table. [read-only] Read ABAP table definition and metadata. Answers: "show table fields", "display table structure", "view table X", "get table definition". Returns field list, package, responsible, description.

**Source:** `src/handlers/table/readonly/handleReadTable.ts`

**Parameters:**
- `table_name` (string, required) - Table name (e.g., Z_MY_TABLE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-translation"></a>
### Read-Only / Translation

<a id="gettranslation-read-only-translation"></a>
#### GetTranslation (Read-Only / Translation)
**Description:** [read-only] Read the SE63 translation of one object: every text key with its source text (original language), its text in the target language and its max length — e.g. a data element's DDTEXT/REPTEXT/SCRTEXT_S/M/L. PREREQUISITE: an RFC connection and the SE63 helper function group ZMCP_LXE on the SAP system; if it is missing the error says so — install it once with SetupTranslationHelper (ask the user first, it creates Z code).

**Notes:** Reads through LXE_OBJ_TEXT_PAIR_READ, the entry point SE63 itself uses, via the RFC-enabled helper Z_MCP_LXE_READ (installed by SetupTranslationHelper). An empty target means that key has no translation in that language. object_type is the LXE (SE63) object type: DTEL, DOMA, TABT, TRAN, MSAG, MESS, CLAS, … — the same type SE63's short-text editor asks for; object_name is the object's name as SE63 shows it. language accepts the LXE code (zhCN, enUS, deDE), a 2-letter ISO code (ZH, EN, ZF = Chinese traditional) or a SAP 1-character key (1, E); a short code expands to one country variant, reported in language. Reading the ORIGINAL language returns the source text as target (target_is_original_language: true) — that is not a translation.

**Source:** `src/handlers/translation/readonly/handleGetTranslation.ts`

**Parameters:**
- `language` (string, required) - Target language: zhCN / enUS (LXE), ZH / EN (ISO) or 1 / E.
- `object_name` (string, required) - Object name, e.g. ZMY_DATA_ELEMENT.
- `object_type` (string, required) - LXE object type, e.g. DTEL, DOMA, TABT, TRAN, MSAG.
- `source_language` (string, optional (default: the original language).)) - Source language (default: the original language).
- `translation_area` (string, optional) - 

---

<a id="read-only-transport"></a>
### Read-Only / Transport

<a id="gettransport-read-only-transport"></a>
#### GetTransport (Read-Only / Transport)
**Description:** [read-only] Retrieve ABAP transport request information including metadata, included objects, and status from SAP system. include_objects: false strips objects from the task entries too.

**Notes:** Response size. A request's objects appear in TWO places: flat under the request, and nested inside each of its tasks. include_objects: false removes both (a caller who asked for "no objects" used to still get every object nested under the tasks — 68 KB / 2467 lines for a request whose object-free answer is ~20 lines). To see only the request header, pass include_objects: false AND include_tasks: false.  object_count / task_count always report what was PARSED, so they read 0 when the corresponding flag is false. Use them to judge the response you asked for, not the size of the request.

**Source:** `src/handlers/transport/readonly/handleGetTransport.ts`

**Parameters:**
- `include_objects` (boolean, optional (default: true))) - Include list of objects in transport (default: true)
- `include_tasks` (boolean, optional (default: true))) - Include list of tasks in transport (default: true)
- `transport_number` (string, required) - Transport request number (e.g., ABCK900001, ABCK900002)

---

<a id="listtransports-read-only-transport"></a>
#### ListTransports (Read-Only / Transport)
**Description:** [read-only] List transport requests owned by the current or a given user. Reads the ADT transport-organizer tree and, when that tree is empty, falls back to E070/E07T; `source` names which answered. count:0 means neither route found a request — not merely that the tree was empty.

**Notes:** Why the fallback exists, measured on S/4HANA 2023 FPS02. GET /sap/bc/adt/cts/transportrequests answers HTTP 200 with an empty self-closing <tm:root/> of 297 bytes for every one of thirteen parameter spellings tried — user, targets, status, _action=FIND, trfunction/trstatus, requestType, targetSystem, and no parameters at all — while E070 on the same system holds 72 requests and tasks for the same user, including one GetTransport reads back as Modifiable. The organizer tree is driven by transport search configurations, and /cts/transportrequests/searchconfiguration/configurations is empty on that system, which is the most likely cause. The endpoint accepts only application/vnd.sap.adt.transportorganizertree.v1+xml; any other Accept is a 406.  The ADT answer is parsed shape-agnostically: every tm:request anywhere in the document counts. A working organizer tree nests them under workbench/customizing and then modifiable/released, and the two hard-coded paths used before would have reported zero for that shape too.  The fallback lists top-level REQUESTS only (E070-STRKORR empty); tasks belong to their request and are read with GetTransport include_tasks. modifiable_only maps to TRSTATUS D or L. Descriptions come from E07T and are best-effort — a missing text never fails the listing.

**Source:** `src/handlers/transport/readonly/handleListTransports.ts`

**Parameters:**
- `max_rows` (number, optional) - Row cap for the E070 fallback. Default 200.
- `modifiable_only` (boolean, optional) - Only not-yet-released requests (TRSTATUS D or L). Default: true.
- `user` (string, optional) - SAP user name. Defaults to the connection user.

---

<a id="read-only-view"></a>
### Read-Only / View

<a id="readview-read-only-view"></a>
#### ReadView (Read-Only / View)
**Description:** Operation: Read, Create, Update. Subject: View. Will be useful for reading, creating, or updating view. [read-only] Read ABAP CDS view source code and metadata. Answers: "show CDS view source", "display view definition", "view CDS X", "get CDS code". Returns source code, package, responsible, description.

**Source:** `src/handlers/view/readonly/handleReadView.ts`

**Parameters:**
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".
- `view_name` (string, required) - View name (e.g., Z_MY_VIEW).

---

<a id="read-only-xslt"></a>
### Read-Only / Xslt

<a id="getxslt-read-only-xslt"></a>
#### GetXslt (Read-Only / Xslt)
**Description:** Operation: Read. Subject: Transformation (XSLT/ST). Retrieve an ABAP transformation: metadata and the XSLT/Simple-Transformation source code.

**Source:** `src/handlers/xslt/readonly/handleGetXslt.ts`

**Parameters:**
- `version` (string, optional) - Version to read: "active" (default) or "inactive".
- `xslt_name` (string, required) - Transformation name (e.g., ZMY_XSLT).

---

*Last updated: 2026-11-09*
