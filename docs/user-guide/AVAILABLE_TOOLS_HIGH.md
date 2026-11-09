# High-Level Tools - MCP ABAP ADT Server

Generated from code in `src/handlers/**` (not from docs).

- Level: High-Level
- Total tools: 171

## Navigation

- [High-Level Group](#high-level-group)
  - [Access Control](#high-level-access-control)
    - [CheckAccessControl](#checkaccesscontrol-high-level-access-control)
    - [CreateAccessControl](#createaccesscontrol-high-level-access-control)
    - [DeleteAccessControl](#deleteaccesscontrol-high-level-access-control)
    - [UpdateAccessControl](#updateaccesscontrol-high-level-access-control)
  - [Behavior Definition](#high-level-behavior-definition)
    - [CheckBehaviorDefinition](#checkbehaviordefinition-high-level-behavior-definition)
    - [CreateBehaviorDefinition](#createbehaviordefinition-high-level-behavior-definition)
    - [DeleteBehaviorDefinition](#deletebehaviordefinition-high-level-behavior-definition)
    - [GetBehaviorDefinition](#getbehaviordefinition-high-level-behavior-definition)
    - [UpdateBehaviorDefinition](#updatebehaviordefinition-high-level-behavior-definition)
  - [Behavior Implementation](#high-level-behavior-implementation)
    - [CreateBehaviorImplementation](#createbehaviorimplementation-high-level-behavior-implementation)
    - [DeleteBehaviorImplementation](#deletebehaviorimplementation-high-level-behavior-implementation)
    - [GetBehaviorImplementation](#getbehaviorimplementation-high-level-behavior-implementation)
    - [UpdateBehaviorImplementation](#updatebehaviorimplementation-high-level-behavior-implementation)
  - [Class](#high-level-class)
    - [CheckClass](#checkclass-high-level-class)
    - [CreateClass](#createclass-high-level-class)
    - [DeleteClass](#deleteclass-high-level-class)
    - [DeleteLocalDefinitions](#deletelocaldefinitions-high-level-class)
    - [DeleteLocalMacros](#deletelocalmacros-high-level-class)
    - [DeleteLocalTestClass](#deletelocaltestclass-high-level-class)
    - [DeleteLocalTypes](#deletelocaltypes-high-level-class)
    - [GetClass](#getclass-high-level-class)
    - [GetLocalDefinitions](#getlocaldefinitions-high-level-class)
    - [GetLocalMacros](#getlocalmacros-high-level-class)
    - [GetLocalTestClass](#getlocaltestclass-high-level-class)
    - [GetLocalTypes](#getlocaltypes-high-level-class)
    - [UpdateClass](#updateclass-high-level-class)
    - [UpdateClassMethod](#updateclassmethod-high-level-class)
    - [UpdateLocalDefinitions](#updatelocaldefinitions-high-level-class)
    - [UpdateLocalMacros](#updatelocalmacros-high-level-class)
    - [UpdateLocalTestClass](#updatelocaltestclass-high-level-class)
    - [UpdateLocalTypes](#updatelocaltypes-high-level-class)
  - [Common](#high-level-common)
    - [ActivateObjects](#activateobjects-high-level-common)
  - [Compact](#high-level-compact)
    - [HandlerActivate](#handleractivate-high-level-compact)
    - [HandlerAtc](#handleratc-high-level-compact)
    - [HandlerCdsUnitTestResult](#handlercdsunittestresult-high-level-compact)
    - [HandlerCdsUnitTestStatus](#handlercdsunitteststatus-high-level-compact)
    - [HandlerCheckRun](#handlercheckrun-high-level-compact)
    - [HandlerCreate](#handlercreate-high-level-compact)
    - [HandlerDelete](#handlerdelete-high-level-compact)
    - [HandlerDumpList](#handlerdumplist-high-level-compact)
    - [HandlerDumpView](#handlerdumpview-high-level-compact)
    - [HandlerGet](#handlerget-high-level-compact)
    - [HandlerInactiveObjects](#handlerinactiveobjects-high-level-compact)
    - [HandlerLock](#handlerlock-high-level-compact)
    - [HandlerProfileList](#handlerprofilelist-high-level-compact)
    - [HandlerProfileRun](#handlerprofilerun-high-level-compact)
    - [HandlerProfileView](#handlerprofileview-high-level-compact)
    - [HandlerQuery](#handlerquery-high-level-compact)
    - [HandlerRuntime](#handlerruntime-high-level-compact)
    - [HandlerSearch](#handlersearch-high-level-compact)
    - [HandlerServiceBindingListTypes](#handlerservicebindinglisttypes-high-level-compact)
    - [HandlerServiceBindingValidate](#handlerservicebindingvalidate-high-level-compact)
    - [HandlerTransportCreate](#handlertransportcreate-high-level-compact)
    - [HandlerUnitTestResult](#handlerunittestresult-high-level-compact)
    - [HandlerUnitTestRun](#handlerunittestrun-high-level-compact)
    - [HandlerUnitTestStatus](#handlerunitteststatus-high-level-compact)
    - [HandlerUnlock](#handlerunlock-high-level-compact)
    - [HandlerUpdate](#handlerupdate-high-level-compact)
    - [HandlerValidate](#handlervalidate-high-level-compact)
  - [Data Element](#high-level-data-element)
    - [CheckDataElement](#checkdataelement-high-level-data-element)
    - [CreateDataElement](#createdataelement-high-level-data-element)
    - [DeleteDataElement](#deletedataelement-high-level-data-element)
    - [GetDataElement](#getdataelement-high-level-data-element)
    - [UpdateDataElement](#updatedataelement-high-level-data-element)
  - [Ddlx](#high-level-ddlx)
    - [CheckMetadataExtension](#checkmetadataextension-high-level-ddlx)
    - [CreateMetadataExtension](#createmetadataextension-high-level-ddlx)
    - [UpdateMetadataExtension](#updatemetadataextension-high-level-ddlx)
  - [Domain](#high-level-domain)
    - [CheckDomain](#checkdomain-high-level-domain)
    - [CreateDomain](#createdomain-high-level-domain)
    - [DeleteDomain](#deletedomain-high-level-domain)
    - [GetDomain](#getdomain-high-level-domain)
    - [UpdateDomain](#updatedomain-high-level-domain)
  - [Function](#high-level-function)
    - [CheckFunctionGroup](#checkfunctiongroup-high-level-function)
    - [CheckFunctionModule](#checkfunctionmodule-high-level-function)
    - [CreateFunctionGroup](#createfunctiongroup-high-level-function)
    - [CreateFunctionModule](#createfunctionmodule-high-level-function)
    - [UpdateFunctionGroup](#updatefunctiongroup-high-level-function)
    - [UpdateFunctionModule](#updatefunctionmodule-high-level-function)
  - [Function Group](#high-level-function-group)
    - [DeleteFunctionGroup](#deletefunctiongroup-high-level-function-group)
    - [GetFunctionGroup](#getfunctiongroup-high-level-function-group)
  - [Function Module](#high-level-function-module)
    - [DeleteFunctionModule](#deletefunctionmodule-high-level-function-module)
    - [GetFunctionModule](#getfunctionmodule-high-level-function-module)
  - [Generator](#high-level-generator)
    - [GenerateRepoObjects](#generaterepoobjects-high-level-generator)
  - [Interface](#high-level-interface)
    - [CheckInterface](#checkinterface-high-level-interface)
    - [CreateInterface](#createinterface-high-level-interface)
    - [DeleteInterface](#deleteinterface-high-level-interface)
    - [GetInterface](#getinterface-high-level-interface)
    - [UpdateInterface](#updateinterface-high-level-interface)
  - [Lockobject](#high-level-lockobject)
    - [CreateLockObject](#createlockobject-high-level-lockobject)
    - [DeleteLockObject](#deletelockobject-high-level-lockobject)
    - [UpdateLockObject](#updatelockobject-high-level-lockobject)
  - [Messageclass](#high-level-messageclass)
    - [AddMessage](#addmessage-high-level-messageclass)
    - [CreateMessageClass](#createmessageclass-high-level-messageclass)
    - [DeleteMessageClass](#deletemessageclass-high-level-messageclass)
    - [UpdateMessage](#updatemessage-high-level-messageclass)
    - [UpdateMessageClass](#updatemessageclass-high-level-messageclass)
  - [Metadata Extension](#high-level-metadata-extension)
    - [DeleteMetadataExtension](#deletemetadataextension-high-level-metadata-extension)
    - [GetMetadataExtension](#getmetadataextension-high-level-metadata-extension)
  - [Package](#high-level-package)
    - [CheckPackage](#checkpackage-high-level-package)
    - [CreatePackage](#createpackage-high-level-package)
    - [DeletePackage](#deletepackage-high-level-package)
    - [GetPackage](#getpackage-high-level-package)
  - [Program](#high-level-program)
    - [CheckProgram](#checkprogram-high-level-program)
    - [CreateProgram](#createprogram-high-level-program)
    - [DeleteProgram](#deleteprogram-high-level-program)
    - [GetProgram](#getprogram-high-level-program)
    - [UpdateProgram](#updateprogram-high-level-program)
    - [UpdateTextElements](#updatetextelements-high-level-program)
  - [Service Binding](#high-level-service-binding)
    - [CreateServiceBinding](#createservicebinding-high-level-service-binding)
    - [DeleteServiceBinding](#deleteservicebinding-high-level-service-binding)
    - [GetServiceBinding](#getservicebinding-high-level-service-binding)
    - [ListServiceBindingTypes](#listservicebindingtypes-high-level-service-binding)
    - [PublishServiceBinding](#publishservicebinding-high-level-service-binding)
    - [UnpublishServiceBinding](#unpublishservicebinding-high-level-service-binding)
    - [UpdateServiceBinding](#updateservicebinding-high-level-service-binding)
    - [ValidateServiceBinding](#validateservicebinding-high-level-service-binding)
  - [Service Definition](#high-level-service-definition)
    - [CreateServiceDefinition](#createservicedefinition-high-level-service-definition)
    - [DeleteServiceDefinition](#deleteservicedefinition-high-level-service-definition)
    - [GetServiceDefinition](#getservicedefinition-high-level-service-definition)
    - [UpdateServiceDefinition](#updateservicedefinition-high-level-service-definition)
  - [Structure](#high-level-structure)
    - [CheckStructure](#checkstructure-high-level-structure)
    - [CreateStructure](#createstructure-high-level-structure)
    - [DeleteStructure](#deletestructure-high-level-structure)
    - [GetStructure](#getstructure-high-level-structure)
    - [UpdateStructure](#updatestructure-high-level-structure)
  - [System](#high-level-system)
    - [GetPackageTree](#getpackagetree-high-level-system)
    - [SetPrettyPrinterSettings](#setprettyprintersettings-high-level-system)
  - [Table](#high-level-table)
    - [CheckTable](#checktable-high-level-table)
    - [CreateTable](#createtable-high-level-table)
    - [CreateTableIndex](#createtableindex-high-level-table)
    - [DeleteTable](#deletetable-high-level-table)
    - [DeleteTableIndex](#deletetableindex-high-level-table)
    - [GetTable](#gettable-high-level-table)
    - [SetTableTechnicalSettings](#settabletechnicalsettings-high-level-table)
    - [UpdateTable](#updatetable-high-level-table)
    - [UpdateTableIndex](#updatetableindex-high-level-table)
  - [Tabletype](#high-level-tabletype)
    - [CreateTableType](#createtabletype-high-level-tabletype)
    - [DeleteTableType](#deletetabletype-high-level-tabletype)
  - [Transaction](#high-level-transaction)
    - [CreateTransaction](#createtransaction-high-level-transaction)
    - [DeleteTransaction](#deletetransaction-high-level-transaction)
    - [SetupTransactionHelper](#setuptransactionhelper-high-level-transaction)
  - [Translation](#high-level-translation)
    - [AddTranslationToTransport](#addtranslationtotransport-high-level-translation)
    - [SetupTranslationHelper](#setuptranslationhelper-high-level-translation)
    - [UpdateTranslation](#updatetranslation-high-level-translation)
  - [Transport](#high-level-transport)
    - [AddTransportUser](#addtransportuser-high-level-transport)
    - [CreateTransport](#createtransport-high-level-transport)
    - [DeleteTransport](#deletetransport-high-level-transport)
    - [MergeTransport](#mergetransport-high-level-transport)
    - [ReleaseTransport](#releasetransport-high-level-transport)
    - [SetTransportOwner](#settransportowner-high-level-transport)
  - [Unit Test](#high-level-unit-test)
    - [CreateCdsUnitTest](#createcdsunittest-high-level-unit-test)
    - [CreateUnitTest](#createunittest-high-level-unit-test)
    - [DeleteCdsUnitTest](#deletecdsunittest-high-level-unit-test)
    - [DeleteUnitTest](#deleteunittest-high-level-unit-test)
    - [GetCdsUnitTest](#getcdsunittest-high-level-unit-test)
    - [GetCdsUnitTestResult](#getcdsunittestresult-high-level-unit-test)
    - [GetCdsUnitTestStatus](#getcdsunitteststatus-high-level-unit-test)
    - [GetUnitTest](#getunittest-high-level-unit-test)
    - [GetUnitTestResult](#getunittestresult-high-level-unit-test)
    - [GetUnitTestStatus](#getunitteststatus-high-level-unit-test)
    - [RunUnitTest](#rununittest-high-level-unit-test)
    - [UpdateCdsUnitTest](#updatecdsunittest-high-level-unit-test)
    - [UpdateUnitTest](#updateunittest-high-level-unit-test)
  - [View](#high-level-view)
    - [CheckView](#checkview-high-level-view)
    - [CreateView](#createview-high-level-view)
    - [DeleteView](#deleteview-high-level-view)
    - [GetView](#getview-high-level-view)
    - [UpdateView](#updateview-high-level-view)
  - [Xslt](#high-level-xslt)
    - [CreateXslt](#createxslt-high-level-xslt)
    - [DeleteXslt](#deletexslt-high-level-xslt)
    - [UpdateXslt](#updatexslt-high-level-xslt)

---

<a id="high-level-group"></a>
## High-Level Group

<a id="high-level-access-control"></a>
### High-Level / Access Control

<a id="checkaccesscontrol-high-level-access-control"></a>
#### CheckAccessControl (High-Level / Access Control)
**Description:** Operation: Check. Subject: Access Control (DCL / DCLS). Syntax-check a DCL. Pass source_code to check a DRAFT before writing it (the check then runs on the text you submit, not on the stored version); omit it to check the stored active or inactive version.

**Source:** `src/handlers/access_control/high/handleCheckAccessControl.ts`

**Parameters:**
- `access_control_name` (string, required) - DCL name (must exist in the system).
- `source_code` (string, optional) - Optional draft source to check INSTEAD of the stored version. Use this to validate before an update.
- `version` (string, optional) - Which stored version to check when source_code is omitted: "active" (default) or "inactive".

---

<a id="createaccesscontrol-high-level-access-control"></a>
#### CreateAccessControl (High-Level / Access Control)
**Description:** Operation: Create. Subject: Access Control (DCL / DCLS) — the CDS authorization layer. Creates a DCL source that restricts who may read a CDS entity. Supply source_code to write the role in the same call (recommended — a DCL with no source cannot activate); omit it to create an empty shell and set the source later with UpdateAccessControl. DCL source shape: "@EndUserText.label: '…'  @MappingRole: true  define role <NAME> { grant select on <CDS_ENTITY> where …; }". The role name normally matches the DCL object name, and the granted entity must be an ACTIVE CDS view.

**Source:** `src/handlers/access_control/high/handleCreateAccessControl.ts`

**Parameters:**
- `access_control_name` (string, required) - DCL name (e.g., Z_MY_VIEW). Start with Z or Y, max 30 chars. By convention it matches the CDS entity it protects.
- `activate` (boolean, optional) - Activate after writing the source. DEFAULT: TRUE, but only applies when source_code is supplied (an empty DCL cannot activate). The activated field in the response is SAP’s own verdict, not a copy of this parameter.
- `description` (string, optional) - Description (defaults to the object name). Max 60 chars; XML metacharacters are escaped for you.
- `package_name` (string, required) - Package name (e.g., $TMP, ZMY_PKG).
- `source_code` (string, optional) - Complete DCL source. Strongly recommended: without it the object is created empty and activation is skipped, because an empty DCL cannot activate.
- `transport_request` (string, optional) - Transport request. Required for transportable packages, omit for $TMP.

---

<a id="deleteaccesscontrol-high-level-access-control"></a>
#### DeleteAccessControl (High-Level / Access Control)
**Description:** Operation: Delete. Subject: Access Control (DCL / DCLS). Delete a DCL source from the SAP system. The deletion is verified against the system afterwards, so a refusal is reported as a failure with SAP’s own reason rather than as success.

**Source:** `src/handlers/access_control/high/handleDeleteAccessControl.ts`

**Parameters:**
- `access_control_name` (string, required) - DCL name.
- `transport_request` (string, optional) - Transport request. Required for transportable objects; omit for $TMP.

---

<a id="updateaccesscontrol-high-level-access-control"></a>
#### UpdateAccessControl (High-Level / Access Control)
**Description:** Operation: Update. Subject: Access Control (DCL / DCLS). Replace the complete source of an existing DCL and optionally activate it. Locks, writes, unlocks, activates. The source must be the WHOLE role definition — this is a replace, not a patch.

**Source:** `src/handlers/access_control/high/handleUpdateAccessControl.ts`

**Parameters:**
- `access_control_name` (string, required) - DCL name (must already exist).
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects are activated together afterwards via ActivateObjects). The activated field in the response is SAP’s own verdict, not a copy of this parameter.
- `source_code` (string, required) - Complete DCL source, e.g. "@EndUserText.label: '…'  @MappingRole: true  define role Z_X { grant select on Z_X where …; }".
- `transport_request` (string, optional) - Transport request (if the object is transportable).

---

<a id="high-level-behavior-definition"></a>
### High-Level / Behavior Definition

<a id="checkbehaviordefinition-high-level-behavior-definition"></a>
#### CheckBehaviorDefinition (High-Level / Behavior Definition)
**Description:** Perform syntax check on an ABAP behavior definition (BDEF). Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/behavior_definition/high/handleCheckBehaviorDefinition.ts`

**Parameters:**
- `name` (string, required) - BehaviorDefinition name (e.g., ZI_MY_BDEF).

---

<a id="createbehaviordefinition-high-level-behavior-definition"></a>
#### CreateBehaviorDefinition (High-Level / Behavior Definition)
**Description:** Operation: Create. Subject: BehaviorDefinition. Will be useful for creating behavior definition. Create a new ABAP Behavior Definition (BDEF) in SAP system. Creates the behavior definition object in initial state.

**Source:** `src/handlers/behavior_definition/high/handleCreateBehaviorDefinition.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after creation. Default: true
- `description` (string, optional) - Description
- `implementation_type` (string, required) - Implementation type: 'Managed', 'Unmanaged', 'Abstract', 'Projection'
- `name` (string, required) - Behavior Definition name (usually same as Root Entity name)
- `package_name` (string, required) - Package name
- `root_entity` (string, required) - Root Entity name (CDS View name)
- `transport_request` (string, optional) - Transport request number

---

<a id="deletebehaviordefinition-high-level-behavior-definition"></a>
#### DeleteBehaviorDefinition (High-Level / Behavior Definition)
**Description:** Delete an ABAP behavior definition from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/behavior_definition/high/handleDeleteBehaviorDefinition.ts`

**Parameters:**
- `behavior_definition_name` (string, required) - BehaviorDefinition name (e.g., Z_MY_BEHAVIORDEFINITION).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getbehaviordefinition-high-level-behavior-definition"></a>
#### GetBehaviorDefinition (High-Level / Behavior Definition)
**Description:** Retrieve ABAP behavior definition definition. Supports reading active or inactive version.

**Source:** `src/handlers/behavior_definition/high/handleGetBehaviorDefinition.ts`

**Parameters:**
- `behavior_definition_name` (string, required) - BehaviorDefinition name (e.g., Z_MY_BEHAVIORDEFINITION).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updatebehaviordefinition-high-level-behavior-definition"></a>
#### UpdateBehaviorDefinition (High-Level / Behavior Definition)
**Description:** Operation: Update, Create. Subject: BehaviorDefinition. Will be useful for updating or creating behavior definition. Update source code of an existing ABAP Behavior Definition (BDEF). Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/behavior_definition/high/handleUpdateBehaviorDefinition.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `lock_handle` (string, optional) - Lock handle from LockObject. If not provided, will attempt to lock internally (not recommended for stateful flows).
- `name` (string, required) - Behavior Definition name
- `source_code` (string, required) - New source code
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="high-level-behavior-implementation"></a>
### High-Level / Behavior Implementation

<a id="createbehaviorimplementation-high-level-behavior-implementation"></a>
#### CreateBehaviorImplementation (High-Level / Behavior Implementation)
**Description:** Create a new ABAP behavior implementation class for a behavior definition. Creates the object in initial state. Use UpdateBehaviorImplementation to set implementation code afterwards.

**Source:** `src/handlers/behavior_implementation/high/handleCreateBehaviorImplementation.ts`

**Parameters:**
- `behavior_definition` (string, required) - Behavior Definition name (e.g., ZI_MY_ENTITY). The behavior definition must exist.
- `class_name` (string, required) - Behavior Implementation class name (e.g., ZBP_MY_ENTITY). Must follow SAP naming conventions (typically starts with ZBP_ for behavior implementations).
- `description` (string, optional) - Class description. If not provided, class_name will be used.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects)
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deletebehaviorimplementation-high-level-behavior-implementation"></a>
#### DeleteBehaviorImplementation (High-Level / Behavior Implementation)
**Description:** Delete an ABAP behavior implementation from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/behavior_implementation/high/handleDeleteBehaviorImplementation.ts`

**Parameters:**
- `behavior_implementation_name` (string, required) - BehaviorImplementation name (e.g., Z_MY_BEHAVIORIMPLEMENTATION).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getbehaviorimplementation-high-level-behavior-implementation"></a>
#### GetBehaviorImplementation (High-Level / Behavior Implementation)
**Description:** Retrieve ABAP behavior implementation definition. Supports reading active or inactive version.

**Source:** `src/handlers/behavior_implementation/high/handleGetBehaviorImplementation.ts`

**Parameters:**
- `behavior_implementation_name` (string, required) - BehaviorImplementation name (e.g., Z_MY_BEHAVIORIMPLEMENTATION).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updatebehaviorimplementation-high-level-behavior-implementation"></a>
#### UpdateBehaviorImplementation (High-Level / Behavior Implementation)
**Description:** Update source code of an existing ABAP behavior implementation class. Updates both main source (with FOR BEHAVIOR OF clause) and implementations include. Uses stateful session with proper lock/unlock mechanism.

**Source:** `src/handlers/behavior_implementation/high/handleUpdateBehaviorImplementation.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `behavior_definition` (string, required) - Behavior Definition name (e.g., ZI_MY_ENTITY). Must match the behavior definition used when creating the class.
- `class_name` (string, required) - Behavior Implementation class name (e.g., ZBP_MY_ENTITY). Must exist in the system.
- `implementation_code` (string, required) - Implementation code for the implementations include. Contains the actual behavior implementation methods.
- `main_source` (string, optional) - OPTIONAL full global-class source (the CLASS ... DEFINITION PUBLIC ABSTRACT FINAL FOR BEHAVIOR OF ... body). Provide this ONLY when the behavior pool needs a custom PUBLIC SECTION (e.g. a public CLASS-DATA the CCIMP references). When omitted, a bare skeleton is generated (correct for most pools). When given, the global class is written via getClass().update + getLocalTypes().update instead of the skeleton-overwriting path.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.

---

<a id="high-level-class"></a>
### High-Level / Class

<a id="checkclass-high-level-class"></a>
#### CheckClass (High-Level / Class)
**Description:** Perform syntax check on an ABAP class. Checks the stored version, or a source you supply for an existing class. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/class/high/handleCheckClass.ts`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `source_code` (string, optional) - Optional: source to check INSTEAD of the stored version. The object must ALREADY EXIST — a checkrun against a name SAP does not know answers "Resource ... does not exist" whatever version is asked for (measured on 7.58), so this validates a CHANGE, not a hypothetical new object. Must include complete CLASS DEFINITION and IMPLEMENTATION sections.
- `version` (string, optional) - Version to check: 'active' (last activated) or 'inactive' (current unsaved). Default: active.

---

<a id="createclass-high-level-class"></a>
#### CreateClass (High-Level / Class)
**Description:** Operation: Create. Subject: Class. Will be useful for creating class. Create a new ABAP class in SAP system. Creates the class object in initial state.

**Source:** `src/handlers/class/high/handleCreateClass.ts`

**Parameters:**
- `abstract` (boolean, optional) - Mark class as abstract. Default: false
- `class_name` (string, required) - Class name (e.g., ZCL_TEST_CLASS_001).
- `create_protected` (boolean, optional) - Protected constructor. Default: false
- `description` (string, optional) - Class description (defaults to class_name).
- `final` (boolean, optional) - Mark class as final. Default: false
- `package_name` (string, required) - Package name (e.g., ZOK_LAB, $TMP).
- `superclass` (string, optional) - Optional superclass name.
- `transport_request` (string, optional) - Transport request number (required for transportable packages).

---

<a id="deleteclass-high-level-class"></a>
#### DeleteClass (High-Level / Class)
**Description:** Delete an ABAP class from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/class/high/handleDeleteClass.ts`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="deletelocaldefinitions-high-level-class"></a>
#### DeleteLocalDefinitions (High-Level / Class)
**Description:** Delete local definitions from an ABAP class by clearing the definitions include. Manages lock, update, unlock, and optional activation.

**Source:** `src/handlers/class/high/handleDeleteLocalDefinitions.ts`

**Parameters:**
- `activate_on_delete` (boolean, optional (default: false)) - Activate parent class after deleting. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number.

---

<a id="deletelocalmacros-high-level-class"></a>
#### DeleteLocalMacros (High-Level / Class)
**Description:** Delete local macros from an ABAP class by clearing the macros include. Manages lock, update, unlock, and optional activation. Note: Macros are supported in older ABAP versions but not in newer ones.

**Source:** `src/handlers/class/high/handleDeleteLocalMacros.ts`

**Parameters:**
- `activate_on_delete` (boolean, optional (default: false)) - Activate parent class after deleting. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number.

---

<a id="deletelocaltestclass-high-level-class"></a>
#### DeleteLocalTestClass (High-Level / Class)
**Description:** Delete a local test class from an ABAP class by clearing the testclasses include. Manages lock, update, unlock, and optional activation of parent class.

**Source:** `src/handlers/class/high/handleDeleteLocalTestClass.ts`

**Parameters:**
- `activate_on_delete` (boolean, optional (default: false)) - Activate parent class after deleting test class. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number (required for transportable objects).

---

<a id="deletelocaltypes-high-level-class"></a>
#### DeleteLocalTypes (High-Level / Class)
**Description:** Delete local types from an ABAP class by clearing the implementations include. Manages lock, update, unlock, and optional activation.

**Source:** `src/handlers/class/high/handleDeleteLocalTypes.ts`

**Parameters:**
- `activate_on_delete` (boolean, optional (default: false)) - Activate parent class after deleting. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number.

---

<a id="getclass-high-level-class"></a>
#### GetClass (High-Level / Class)
**Description:** Retrieve ABAP class source code. Supports reading active or inactive version.

**Source:** `src/handlers/class/high/handleGetClass.ts`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="getlocaldefinitions-high-level-class"></a>
#### GetLocalDefinitions (High-Level / Class)
**Description:** Retrieve local definitions source code from a class (definitions include). Supports reading active or inactive version.

**Source:** `src/handlers/class/high/handleGetLocalDefinitions.ts`

**Parameters:**
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="getlocalmacros-high-level-class"></a>
#### GetLocalMacros (High-Level / Class)
**Description:** Retrieve local macros source code from a class (macros include). Supports reading active or inactive version. Note: Macros are supported in older ABAP versions but not in newer ones.

**Source:** `src/handlers/class/high/handleGetLocalMacros.ts`

**Parameters:**
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="getlocaltestclass-high-level-class"></a>
#### GetLocalTestClass (High-Level / Class)
**Description:** Retrieve local test class source code from a class. Supports reading active or inactive version.

**Source:** `src/handlers/class/high/handleGetLocalTestClass.ts`

**Parameters:**
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="getlocaltypes-high-level-class"></a>
#### GetLocalTypes (High-Level / Class)
**Description:** Retrieve local types source code from a class (implementations include). Supports reading active or inactive version.

**Source:** `src/handlers/class/high/handleGetLocalTypes.ts`

**Parameters:**
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updateclass-high-level-class"></a>
#### UpdateClass (High-Level / Class)
**Description:** Operation: Update, Create. Subject: Class. Will be useful for updating or creating class. Update source code of an existing ABAP class. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/class/high/handleUpdateClass.ts`

**Parameters:**
- `activate` (boolean, optional (default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict)) - Activate after the update. DEFAULT: FALSE — omitting it leaves the object INACTIVE, so pass true explicitly if you want it usable. (Update* tools are not consistent on this default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `class_name` (string, required) - Class name (e.g., ZCL_TEST_CLASS_001).
- `source_code` (string, required) - Complete ABAP class source code.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="updateclassmethod-high-level-class"></a>
#### UpdateClassMethod (High-Level / Class)
**Description:** Operation: Update. Subject: Class method. Replace ONE method's implementation body without resending the whole class source. Use GetClassMethods to find method_name first. Only the body between METHOD/ENDMETHOD changes.

**Notes:** Cannot change a signature, visibility, or add/remove/move a method — those touch the DEFINITION section, which this tool never rewrites. Use UpdateClass with the full source for those. Everything outside the target method (every other method, the whole DEFINITION section, comments) survives byte-for-byte.

**Source:** `src/handlers/class/high/handleUpdateClassMethod.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: FALSE.
- `base_version` (string, optional (default: active)) - Base to splice into. DEFAULT: "active".
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `method_name` (string, required) - Method name, case-insensitive. Interface methods: "if_x~method_name".
- `new_body` (string, required) - Statements between METHOD and ENDMETHOD (not including those lines). Empty string clears the body.
- `transport_request` (string, optional) - Transport request (e.g., ABCK900001).

---

<a id="updatelocaldefinitions-high-level-class"></a>
#### UpdateLocalDefinitions (High-Level / Class)
**Description:** Update local definitions in an ABAP class (definitions include). Manages lock, check, update, unlock, and optional activation.

**Source:** `src/handlers/class/high/handleUpdateLocalDefinitions.ts`

**Parameters:**
- `activate_on_update` (boolean, optional (default: false)) - Activate parent class after updating. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `definitions_code` (string, required) - Updated source code for local definitions.
- `transport_request` (string, optional) - Transport request number.

---

<a id="updatelocalmacros-high-level-class"></a>
#### UpdateLocalMacros (High-Level / Class)
**Description:** Update local macros in an ABAP class (macros include). Manages lock, check, update, unlock, and optional activation. Note: Macros are supported in older ABAP versions but not in newer ones.

**Source:** `src/handlers/class/high/handleUpdateLocalMacros.ts`

**Parameters:**
- `activate_on_update` (boolean, optional (default: false)) - Activate parent class after updating. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `macros_code` (string, required) - Updated source code for local macros.
- `transport_request` (string, optional) - Transport request number.

---

<a id="updatelocaltestclass-high-level-class"></a>
#### UpdateLocalTestClass (High-Level / Class)
**Description:** Update a local test class in an ABAP class. Manages lock, check, update, unlock, and optional activation of parent class.

**Source:** `src/handlers/class/high/handleUpdateLocalTestClass.ts`

**Parameters:**
- `activate_on_update` (boolean, optional (default: false)) - Activate parent class after updating test class. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `test_class_code` (string, required) - Updated source code for the local test class.
- `transport_request` (string, optional) - Transport request number (required for transportable objects).

---

<a id="updatelocaltypes-high-level-class"></a>
#### UpdateLocalTypes (High-Level / Class)
**Description:** Update local types in an ABAP class (implementations include). Manages lock, check, update, unlock, and optional activation.

**Source:** `src/handlers/class/high/handleUpdateLocalTypes.ts`

**Parameters:**
- `activate_on_update` (boolean, optional (default: false)) - Activate parent class after updating. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `local_types_code` (string, required) - Updated source code for local types.
- `transport_request` (string, optional) - Transport request number.

---

<a id="high-level-common"></a>
### High-Level / Common

<a id="activateobjects-high-level-common"></a>
#### ActivateObjects (High-Level / Common)
**Description:** Activate one or multiple ABAP repository objects. Use after Create/Update when objects remain inactive, or for group activation of related objects (e.g., domains + data elements + tables together). Works with any object type.

**Source:** `src/handlers/common/high/handleActivateObjects.ts`

**Parameters:**
- `objects` (array, required) - Array of objects to activate. Each object must have 'name' and 'type'.
- `preaudit` (boolean, optional) - Request pre-audit before activation. Default: true

---

<a id="high-level-compact"></a>
### High-Level / Compact

<a id="handleractivate-high-level-compact"></a>
#### HandlerActivate (High-Level / Compact)
**Description:** Activate operation. Single mode(object_name*, object_adt_type*). Batch mode(objects[].name*, objects[].type*).

**Source:** `src/handlers/compact/high/handleHandlerActivate.ts`

**Parameters:**
- `object_adt_type` (string, optional) - ADT object type code (e.g. CLAS/OC, PROG/P). Required for single-object activation form.
- `object_name` (string, optional) - Object name for single-object activation form.
- `object_type` (any, optional) - 
- `objects` (array, optional) - Explicit objects list for batch activation.
- `preaudit` (boolean, optional) - Run pre-audit checks before activation.

---

<a id="handleratc-high-level-compact"></a>
#### HandlerAtc (High-Level / Compact)
**Description:** ATC. operation='run' (needs object_name + object_type) | 'worklist' (needs worklist_id) | 'customizing'. Optional: check_variant, max_priority, summary. Response: JSON findings.

**Source:** `src/handlers/compact/high/handleHandlerAtc.ts`

**Parameters:**
- `check_variant` (string, optional) - Check variant name. Verified against SCICHKV_HD; an unknown name is refused rather than silently replaced by DEFAULT.
- `max_priority` (number, optional) - Highest priority to report.
- `object_name` (string, optional) - For operation='run'.
- `object_type` (string, optional) - For operation='run', e.g. 'package', 'class'.
- `operation` (string, required) - 'run' executes a check; 'worklist' re-reads a previous run by id; 'customizing' reports the system's ATC configuration.
- `summary` (boolean, optional) - Counts only.
- `worklist_id` (string, optional) - Required for operation='worklist'.

---

<a id="handlercdsunittestresult-high-level-compact"></a>
#### HandlerCdsUnitTestResult (High-Level / Compact)
**Description:** CDS unit test result. object_type: not used. Required: run_id*. Optional: with_navigation_uris, format(abapunit|junit). Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerCdsUnitTestResult.ts`

**Parameters:**
- `aggregate` (boolean, optional) - Aggregate profiling data.
- `all_db_events` (boolean, optional) - Trace all DB events.
- `all_dynpro_events` (boolean, optional) - Trace dynpro events.
- `all_internal_table_events` (boolean, optional) - Trace internal table events.
- `all_misc_abap_statements` (boolean, optional) - Trace miscellaneous ABAP statements.
- `all_procedural_units` (boolean, optional) - Trace all procedural units.
- `all_system_kernel_events` (boolean, optional) - Trace system kernel events.
- `amdp_trace` (boolean, optional) - Enable AMDP tracing.
- `class_name` (string, optional) - Class name for profiling.
- `description` (string, optional) - Profiler run description.
- `explicit_on_off` (boolean, optional) - Use explicit on/off trace sections.
- `max_size_for_trace_file` (number, optional) - Maximum trace file size.
- `max_time_for_tracing` (number, optional) - Maximum tracing time.
- `program_name` (string, optional) - Program name for profiling.
- `sql_trace` (boolean, optional) - Enable SQL trace.
- `target_type` (string, required) - Profile execution target kind.
- `with_rfc_tracing` (boolean, optional) - Enable RFC tracing.

---

<a id="handlercdsunitteststatus-high-level-compact"></a>
#### HandlerCdsUnitTestStatus (High-Level / Compact)
**Description:** CDS unit test status. object_type: not used. Required: run_id*. Optional: with_long_polling. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerCdsUnitTestStatus.ts`

**Parameters:**
- `aggregate` (boolean, optional) - Aggregate profiling data.
- `all_db_events` (boolean, optional) - Trace all DB events.
- `all_dynpro_events` (boolean, optional) - Trace dynpro events.
- `all_internal_table_events` (boolean, optional) - Trace internal table events.
- `all_misc_abap_statements` (boolean, optional) - Trace miscellaneous ABAP statements.
- `all_procedural_units` (boolean, optional) - Trace all procedural units.
- `all_system_kernel_events` (boolean, optional) - Trace system kernel events.
- `amdp_trace` (boolean, optional) - Enable AMDP tracing.
- `class_name` (string, optional) - Class name for profiling.
- `description` (string, optional) - Profiler run description.
- `explicit_on_off` (boolean, optional) - Use explicit on/off trace sections.
- `max_size_for_trace_file` (number, optional) - Maximum trace file size.
- `max_time_for_tracing` (number, optional) - Maximum tracing time.
- `program_name` (string, optional) - Program name for profiling.
- `sql_trace` (boolean, optional) - Enable SQL trace.
- `target_type` (string, required) - Profile execution target kind.
- `with_rfc_tracing` (boolean, optional) - Enable RFC tracing.

---

<a id="handlercheckrun-high-level-compact"></a>
#### HandlerCheckRun (High-Level / Compact)
**Description:** CheckRun operation (syntax, no activation). object_type required: CLASS(object_name*), PROGRAM(object_name*), INTERFACE(object_name*), FUNCTION_GROUP(object_name*), FUNCTION_MODULE(object_name*), TABLE(object_name*), STRUCTURE(object_name*), VIEW(object_name*), DOMAIN(object_name*), DATA_ELEMENT(object_name*), PACKAGE(object_name*), BEHAVIOR_DEFINITION(object_name*), BEHAVIOR_IMPLEMENTATION(object_name*), METADATA_EXTENSION(object_name*).

**Source:** `src/handlers/compact/high/handleHandlerCheckRun.ts`

**Parameters:**
- `session_id` (string, optional) - Optional ADT session id for stateful check flow.
- `session_state` (object, optional) - Optional ADT session state container (cookies/CSRF) for stateful check flow.
- `version` (string, optional (default: active)) - Version to syntax-check.

---

<a id="handlercreate-high-level-compact"></a>
#### HandlerCreate (High-Level / Compact)
**Description:** Create operation. object_type required: PACKAGE(package_name*), DOMAIN(domain_name*), DATA_ELEMENT(data_element_name*), TABLE(table_name*), STRUCTURE(structure_name*), VIEW(view_name*), SERVICE_DEFINITION(service_definition_name*), SERVICE_BINDING(service_binding_name*), CLASS(class_name*), PROGRAM(program_name*) [onprem/legacy only], INTERFACE(interface_name*), FUNCTION_GROUP(function_group_name*), FUNCTION_MODULE(function_module_name*, function_group_name*), BEHAVIOR_DEFINITION(behavior_definition_name*), BEHAVIOR_IMPLEMENTATION(behavior_implementation_name*), METADATA_EXTENSION(metadata_extension_name*), UNIT_TEST(run_id*), CDS_UNIT_TEST(run_id*).

**Source:** `src/handlers/compact/high/handleHandlerCreate.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate object after create.
- `application` (string, optional) - Domain application area.
- `class_name` (string, optional) - ABAP class name.
- `conversion_exit` (string, optional) - Conversion exit name.
- `datatype` (string, optional) - ABAP data type.
- `decimals` (number, optional) - Decimal places.
- `description` (string, optional) - Human-readable object description.
- `domain_name` (string, optional) - ABAP domain name.
- `fixed_values` (array, optional) - Domain fixed values list.
- `function_group_name` (string, optional) - ABAP function group name.
- `function_module_name` (string, optional) - ABAP function module name.
- `length` (number, optional) - Length for typed artifacts.
- `lowercase` (boolean, optional) - Allow lowercase values (domain setting).
- `object_type` (any, required) - 
- `package_name` (string, optional) - ABAP package name.
- `program_name` (string, optional) - ABAP program name.
- `program_type` (string, optional) - ABAP program type.
- `sign_exists` (boolean, optional) - Allow signed values (domain setting).
- `transport_request` (string, optional) - Transport request id (if required by system).
- `value_table` (string, optional) - Foreign key value table.

---

<a id="handlerdelete-high-level-compact"></a>
#### HandlerDelete (High-Level / Compact)
**Description:** Delete operation. object_type required: PACKAGE(package_name*), DOMAIN(domain_name*), DATA_ELEMENT(data_element_name*), TABLE(table_name*), STRUCTURE(structure_name*), VIEW(view_name*), SERVICE_DEFINITION(service_definition_name*), SERVICE_BINDING(service_binding_name*), CLASS(class_name*), LOCAL_TEST_CLASS(class_name*), LOCAL_TYPES(class_name*), LOCAL_DEFINITIONS(class_name*), LOCAL_MACROS(class_name*), PROGRAM(program_name*) [onprem/legacy only], INTERFACE(interface_name*), FUNCTION_GROUP(function_group_name*), FUNCTION_MODULE(function_module_name*, function_group_name*), BEHAVIOR_DEFINITION(behavior_definition_name*), BEHAVIOR_IMPLEMENTATION(behavior_implementation_name*), METADATA_EXTENSION(metadata_extension_name*), UNIT_TEST(run_id*), CDS_UNIT_TEST(run_id*).

**Source:** `src/handlers/compact/high/handleHandlerDelete.ts`

**Parameters:**
- `class_name` (string, optional) - ABAP class name.
- `domain_name` (string, optional) - ABAP domain name.
- `function_group_name` (string, optional) - ABAP function group name.
- `function_module_name` (string, optional) - ABAP function module name.
- `object_type` (any, required) - 
- `program_name` (string, optional) - ABAP program name.
- `transport_request` (string, optional) - Transport request id (if required by system).

---

<a id="handlerdumplist-high-level-compact"></a>
#### HandlerDumpList (High-Level / Compact)
**Description:** Runtime dump list. object_type: not used. Required: none. Optional: user, top, from, to. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerDumpList.ts`

**Parameters:**
- `from` (string, optional) - Start of time range (YYYYMMDDHHMMSS).
- `to` (string, optional) - End of time range (YYYYMMDDHHMMSS).
- `top` (number, optional) - Limit number of returned dumps.
- `user` (string, optional) - Filter dumps by user.

---

<a id="handlerdumpview-high-level-compact"></a>
#### HandlerDumpView (High-Level / Compact)
**Description:** Runtime dump view. object_type: not used. Required: dump_id*. Optional: view(default|summary|formatted). Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerDumpView.ts`

**Parameters:**
- `dump_id` (string, required) - Runtime dump id.
- `view` (string, optional (default: default)) - Dump rendering mode.

---

<a id="handlerget-high-level-compact"></a>
#### HandlerGet (High-Level / Compact)
**Description:** Read operation. object_type required: PACKAGE(package_name*), DOMAIN(domain_name*), DATA_ELEMENT(data_element_name*), TABLE(table_name*), STRUCTURE(structure_name*), VIEW(view_name*), SERVICE_DEFINITION(service_definition_name*), SERVICE_BINDING(service_binding_name*), CLASS(class_name*), LOCAL_TEST_CLASS(class_name*), LOCAL_TYPES(class_name*), LOCAL_DEFINITIONS(class_name*), LOCAL_MACROS(class_name*), PROGRAM(program_name*) [onprem/legacy only], INTERFACE(interface_name*), FUNCTION_GROUP(function_group_name*), FUNCTION_MODULE(function_module_name*, function_group_name*), BEHAVIOR_DEFINITION(behavior_definition_name*), BEHAVIOR_IMPLEMENTATION(behavior_implementation_name*), METADATA_EXTENSION(metadata_extension_name*), UNIT_TEST(run_id*), CDS_UNIT_TEST(run_id*).

**Source:** `src/handlers/compact/high/handleHandlerGet.ts`

**Parameters:**
- `behavior_definition_name` (string, optional) - Behavior definition name.
- `behavior_implementation_name` (string, optional) - Behavior implementation name.
- `class_name` (string, optional) - Class name.
- `data_element_name` (string, optional) - Data element name.
- `domain_name` (string, optional) - Domain name.
- `function_group_name` (string, optional) - Function group name.
- `function_module_name` (string, optional) - Function module name.
- `interface_name` (string, optional) - Interface name.
- `metadata_extension_name` (string, optional) - Metadata extension name.
- `object_type` (any, required) - 
- `package_name` (string, optional) - Package name.
- `program_name` (string, optional) - Program name.
- `response_format` (string, optional) - Response format for SERVICE_BINDING reads.
- `run_id` (string, optional) - Unit test run id.
- `service_binding_name` (string, optional) - Service binding name.
- `service_definition_name` (string, optional) - Service definition name.
- `structure_name` (string, optional) - Structure name.
- `table_name` (string, optional) - Table name.
- `version` (any, optional) - 
- `view_name` (string, optional) - View name.

---

<a id="handlerinactiveobjects-high-level-compact"></a>
#### HandlerInactiveObjects (High-Level / Compact)
**Description:** List objects left INACTIVE in the system — the sweep that catches what a failed write left behind. Optional: name_prefix, object_type. Response: JSON list with uri.

**Source:** `src/handlers/compact/high/handleHandlerInactiveObjects.ts`

**Parameters:**
- `name_prefix` (string, optional) - Only objects whose name starts with this.
- `object_type` (string, optional) - Only this ADT type, e.g. 'CLAS/OC'.

---

<a id="handlerlock-high-level-compact"></a>
#### HandlerLock (High-Level / Compact)
**Description:** Lock operation. object_type required: CLASS(object_name*), PROGRAM(object_name*), INTERFACE(object_name*), FUNCTION_GROUP(object_name*), FUNCTION_MODULE(object_name*), TABLE(object_name*), STRUCTURE(object_name*), VIEW(object_name*), DOMAIN(object_name*), DATA_ELEMENT(object_name*), PACKAGE(object_name*), BEHAVIOR_DEFINITION(object_name*), BEHAVIOR_IMPLEMENTATION(object_name*), METADATA_EXTENSION(object_name*).

**Source:** `src/handlers/compact/high/handleHandlerLock.ts`

**Parameters:**
- `session_id` (string, optional) - Optional ADT session id for stateful lock flow.
- `session_state` (object, optional) - Optional ADT session state container (cookies/CSRF) for stateful lock flow.
- `super_package` (string, optional) - Super package context when relevant.

---

<a id="handlerprofilelist-high-level-compact"></a>
#### HandlerProfileList (High-Level / Compact)
**Description:** Runtime profiling list. object_type: not used. Required: none. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerProfileList.ts`

**Parameters:**
- See schema reference `compactProfileListSchema` in source file

---

<a id="handlerprofilerun-high-level-compact"></a>
#### HandlerProfileRun (High-Level / Compact)
**Description:** Runtime profiling run. object_type: not used. Required: target_type*(CLASS|PROGRAM) + class_name* for CLASS or program_name* for PROGRAM. Optional profiling flags and description. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerProfileRun.ts`

**Parameters:**
- `aggregate` (boolean, optional) - Aggregate profiling data.
- `all_db_events` (boolean, optional) - Trace all DB events.
- `all_dynpro_events` (boolean, optional) - Trace dynpro events.
- `all_internal_table_events` (boolean, optional) - Trace internal table events.
- `all_misc_abap_statements` (boolean, optional) - Trace miscellaneous ABAP statements.
- `all_procedural_units` (boolean, optional) - Trace all procedural units.
- `all_system_kernel_events` (boolean, optional) - Trace system kernel events.
- `amdp_trace` (boolean, optional) - Enable AMDP tracing.
- `class_name` (string, optional) - Class name for profiling.
- `description` (string, optional) - Profiler run description.
- `explicit_on_off` (boolean, optional) - Use explicit on/off trace sections.
- `max_size_for_trace_file` (number, optional) - Maximum trace file size.
- `max_time_for_tracing` (number, optional) - Maximum tracing time.
- `program_name` (string, optional) - Program name for profiling.
- `sql_trace` (boolean, optional) - Enable SQL trace.
- `target_type` (string, required) - Profile execution target kind.
- `with_rfc_tracing` (boolean, optional) - Enable RFC tracing.

---

<a id="handlerprofileview-high-level-compact"></a>
#### HandlerProfileView (High-Level / Compact)
**Description:** Runtime profiling view. object_type: not used. Required: trace_id_or_uri*, view*(hitlist|statements|db_accesses). Optional: with_system_events, id, with_details, auto_drill_down_threshold. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerProfileView.ts`

**Parameters:**
- `auto_drill_down_threshold` (number, optional) - Auto drill-down threshold.
- `id` (number, optional) - Optional statement/access id.
- `trace_id_or_uri` (string, required) - Profiler trace id or URI.
- `view` (string, required) - Profiler trace view kind.
- `with_details` (boolean, optional) - Include detailed payload.
- `with_system_events` (boolean, optional) - Include system events in analysis.

---

<a id="handlerquery-high-level-compact"></a>
#### HandlerQuery (High-Level / Compact)
**Description:** Read data. operation='sql' (needs sql_query) or 'table' (needs table_name). Optional: max_rows. Response: JSON rows.

**Source:** `src/handlers/compact/high/handleHandlerQuery.ts`

**Parameters:**
- `max_rows` (number, optional) - Row cap. Default 100.
- `operation` (string, required) - 'sql' runs a SELECT; 'table' reads one table's rows.
- `sql_query` (string, optional) - Required for operation='sql'. One SELECT statement.
- `table_name` (string, optional) - Required for operation='table'.

---

<a id="handlerruntime-high-level-compact"></a>
#### HandlerRuntime (High-Level / Compact)
**Description:** Execute. object_type='program' (onprem only) or 'class' (needs IF_OO_ADT_CLASSRUN). Required: object_name. Optional: profile, description. Response: JSON output.

**Source:** `src/handlers/compact/high/handleHandlerRuntime.ts`

**Parameters:**
- `description` (string, optional) - Trace description.
- `object_name` (string, required) - Program or class name.
- `object_type` (string, required) - 'program' runs a report (onprem only); 'class' runs a class implementing IF_OO_ADT_CLASSRUN.
- `profile` (boolean, optional) - Run with the profiler.

---

<a id="handlersearch-high-level-compact"></a>
#### HandlerSearch (High-Level / Compact)
**Description:** Find things. operation='object' (needs object_name) | 'source' (needs query + packages, onprem only) | 'where_used' (needs object_name + object_type). Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerSearch.ts`

**Parameters:**
- `max_results` (number, optional) - Result cap.
- `object_name` (string, optional) - Required for operation='object' and 'where_used'.
- `object_type` (string, optional) - Object type. Required for operation='where_used' (e.g. 'class', 'table').
- `operation` (string, required) - 'object' finds objects by name; 'source' scans source text inside packages (onprem only); 'where_used' lists references to one object.
- `packages` (array, optional) - Required for operation='source'. PACKAGE names (not object names), e.g. ["$TMP"]. Narrow this — it is what makes the scan fast.
- `query` (string, optional) - Required for operation='source'. Substring to match.

---

<a id="handlerservicebindinglisttypes-high-level-compact"></a>
#### HandlerServiceBindingListTypes (High-Level / Compact)
**Description:** Service binding types list. object_type: not used. Required: none. Optional: response_format(xml|json|plain). Response: XML/JSON/plain by response_format.

**Source:** `src/handlers/compact/high/handleHandlerServiceBindingListTypes.ts`

**Parameters:**
- `response_format` (string, optional (default: xml)) - Response format for protocol types list.

---

<a id="handlerservicebindingvalidate-high-level-compact"></a>
#### HandlerServiceBindingValidate (High-Level / Compact)
**Description:** Service binding validate before create. object_type: not used. Required: service_binding_name*, service_definition_name*. Optional: service_binding_version, package_name, description. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerServiceBindingValidate.ts`

**Parameters:**
- `description` (string, optional) - Binding description.
- `package_name` (string, optional) - Target package name.
- `service_binding_name` (string, required) - Service binding name to validate.
- `service_binding_version` (string, optional) - Service binding version.
- `service_definition_name` (string, required) - Service definition name to pair with binding.

---

<a id="handlertransportcreate-high-level-compact"></a>
#### HandlerTransportCreate (High-Level / Compact)
**Description:** Transport create. object_type: not used. Required: description*. Optional: transport_type(workbench|customizing), target_system, owner. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerTransportCreate.ts`

**Parameters:**
- `description` (string, required) - Transport description.
- `owner` (string, optional) - Transport owner user.
- `target_system` (string, optional) - Target system id.
- `transport_type` (string, optional (default: workbench)) - Transport type.

---

<a id="handlerunittestresult-high-level-compact"></a>
#### HandlerUnitTestResult (High-Level / Compact)
**Description:** ABAP Unit result. object_type: not used. Required: run_id*. Optional: with_navigation_uris, format(abapunit|junit). Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerUnitTestResult.ts`

**Parameters:**
- `format` (string, optional) - Result format.
- `run_id` (string, required) - Unit test run id.
- `with_navigation_uris` (boolean, optional (default: false)) - Include ADT navigation URIs in the result payload.

---

<a id="handlerunittestrun-high-level-compact"></a>
#### HandlerUnitTestRun (High-Level / Compact)
**Description:** ABAP Unit run. object_type: not used. Required: tests[]{container_class*, test_class*}. Optional: title, context, scope, risk_level, duration. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerUnitTestRun.ts`

**Parameters:**
- `context` (string, optional) - Run context label.
- `duration` (object, optional) - Allowed duration classes.
- `risk_level` (object, optional) - Allowed risk levels.
- `scope` (object, optional) - ABAP Unit scope flags.
- `tests` (array, required) - List of test classes to run.
- `title` (string, optional) - Run title shown in ABAP Unit logs.

---

<a id="handlerunitteststatus-high-level-compact"></a>
#### HandlerUnitTestStatus (High-Level / Compact)
**Description:** ABAP Unit status. object_type: not used. Required: run_id*. Optional: with_long_polling. Response: JSON.

**Source:** `src/handlers/compact/high/handleHandlerUnitTestStatus.ts`

**Parameters:**
- `run_id` (string, required) - Unit test run id.
- `with_long_polling` (boolean, optional (default: true)) - Use long polling while waiting for completion.

---

<a id="handlerunlock-high-level-compact"></a>
#### HandlerUnlock (High-Level / Compact)
**Description:** Unlock operation. object_type required: CLASS(object_name*, lock_handle*, session_id*), PROGRAM(object_name*, lock_handle*, session_id*), INTERFACE(object_name*, lock_handle*, session_id*), FUNCTION_GROUP(object_name*, lock_handle*, session_id*), FUNCTION_MODULE(object_name*, lock_handle*, session_id*), TABLE(object_name*, lock_handle*, session_id*), STRUCTURE(object_name*, lock_handle*, session_id*), VIEW(object_name*, lock_handle*, session_id*), DOMAIN(object_name*, lock_handle*, session_id*), DATA_ELEMENT(object_name*, lock_handle*, session_id*), PACKAGE(object_name*, lock_handle*, session_id*), BEHAVIOR_DEFINITION(object_name*, lock_handle*, session_id*), BEHAVIOR_IMPLEMENTATION(object_name*, lock_handle*, session_id*), METADATA_EXTENSION(object_name*, lock_handle*, session_id*).

**Source:** `src/handlers/compact/high/handleHandlerUnlock.ts`

**Parameters:**
- `lock_handle` (string, required) - Lock handle returned by lock.
- `session_id` (string, required) - ADT session id used during lock.
- `session_state` (object, optional) - Optional ADT session state container (cookies/CSRF) for stateful unlock flow.

---

<a id="handlerupdate-high-level-compact"></a>
#### HandlerUpdate (High-Level / Compact)
**Description:** Update operation. object_type required: PACKAGE(package_name*), DOMAIN(domain_name*), DATA_ELEMENT(data_element_name*), TABLE(table_name*), STRUCTURE(structure_name*), VIEW(view_name*), SERVICE_DEFINITION(service_definition_name*), SERVICE_BINDING(service_binding_name*), CLASS(class_name*), LOCAL_TEST_CLASS(class_name*), LOCAL_TYPES(class_name*), LOCAL_DEFINITIONS(class_name*), LOCAL_MACROS(class_name*), PROGRAM(program_name*) [onprem/legacy only], INTERFACE(interface_name*), FUNCTION_GROUP(function_group_name*), FUNCTION_MODULE(function_module_name*, function_group_name*), BEHAVIOR_DEFINITION(behavior_definition_name*), BEHAVIOR_IMPLEMENTATION(behavior_implementation_name*), METADATA_EXTENSION(metadata_extension_name*), UNIT_TEST(run_id*), CDS_UNIT_TEST(run_id*).

**Source:** `src/handlers/compact/high/handleHandlerUpdate.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate object after update.
- `class_name` (string, optional) - ABAP class name.
- `conversion_exit` (string, optional) - Conversion exit name.
- `datatype` (string, optional) - ABAP data type.
- `decimals` (number, optional) - Decimal places.
- `description` (string, optional) - Human-readable object description.
- `domain_name` (string, optional) - ABAP domain name.
- `fixed_values` (array, optional) - Domain fixed values list.
- `function_group_name` (string, optional) - ABAP function group name.
- `function_module_name` (string, optional) - ABAP function module name.
- `length` (number, optional) - Length for typed artifacts.
- `lowercase` (boolean, optional) - Allow lowercase values (domain setting).
- `object_type` (any, required) - 
- `package_name` (string, optional) - ABAP package name.
- `program_name` (string, optional) - ABAP program name.
- `sign_exists` (boolean, optional) - Allow signed values (domain setting).
- `source_code` (string, optional) - ABAP source code payload.
- `transport_request` (string, optional) - Transport request id (if required by system).
- `value_table` (string, optional) - Foreign key value table.

---

<a id="handlervalidate-high-level-compact"></a>
#### HandlerValidate (High-Level / Compact)
**Description:** Validate before create only. object_type required: CLASS(object_name*), PROGRAM(object_name*), INTERFACE(object_name*), FUNCTION_GROUP(object_name*), FUNCTION_MODULE(object_name*), TABLE(object_name*), STRUCTURE(object_name*), VIEW(object_name*), DOMAIN(object_name*), DATA_ELEMENT(object_name*), PACKAGE(object_name*), BEHAVIOR_DEFINITION(object_name*), BEHAVIOR_IMPLEMENTATION(object_name*), METADATA_EXTENSION(object_name*), SERVICE_BINDING(object_name*=service_binding_name*, service_definition_name*).

**Source:** `src/handlers/compact/high/handleHandlerValidate.ts`

**Parameters:**
- `behavior_definition` (string, optional) - Optional behavior definition name, used when validating behavior implementation.
- `description` (string, optional) - Optional object description used during validation.
- `implementation_type` (string, optional) - Optional implementation type, used for behavior implementation validation.
- `object_name` (string, required) - Required object name. For SERVICE_BINDING this is the service binding name.
- `object_type` (string, required) - Object type to validate before create. Supported: CLASS, PROGRAM, INTERFACE, FUNCTION_GROUP, FUNCTION_MODULE, TABLE, STRUCTURE, VIEW, DOMAIN, DATA_ELEMENT, PACKAGE, BEHAVIOR_DEFINITION, BEHAVIOR_IMPLEMENTATION, METADATA_EXTENSION, SERVICE_BINDING.
- `package_name` (string, optional) - Optional package context for validation (especially for create scenarios).
- `root_entity` (string, optional) - Optional CDS root entity name, used for behavior-related validation.
- `service_binding_version` (string, optional) - Optional service binding version for SERVICE_BINDING.
- `service_definition_name` (string, optional) - Required when object_type=SERVICE_BINDING. Service definition paired with the binding.
- `session_id` (string, optional) - Optional ADT session id for stateful validation flow.
- `session_state` (object, optional) - Optional ADT session state container (cookies/CSRF) for stateful validation flow.

---

<a id="high-level-data-element"></a>
### High-Level / Data Element

<a id="checkdataelement-high-level-data-element"></a>
#### CheckDataElement (High-Level / Data Element)
**Description:** Perform syntax check on an ABAP data element. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/data_element/high/handleCheckDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - Data element name (e.g., ZDE_MY_ELEMENT).

---

<a id="createdataelement-high-level-data-element"></a>
#### CreateDataElement (High-Level / Data Element)
**Description:** Operation: Create. Subject: DataElement. Will be useful for creating data element. Create a new ABAP data element in SAP system. Creates the data element object in initial state.

**Source:** `src/handlers/data_element/high/handleCreateDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - Data element name (e.g., ZZ_E_TEST_001). Must follow SAP naming conventions.
- `data_type` (string, optional (default: CHAR)) - Data type (e.g., CHAR, NUMC) or domain name when type_kind is 'domain'.
- `decimals` (number, optional (default: 0)) - Decimal places. Usually inherited from domain.
- `description` (string, optional) - Data element description. If not provided, data_element_name will be used.
- `heading_label` (string, optional) - Heading field label (max 55 chars). Applied during update step after creation.
- `length` (number, optional (default: 100)) - Data type length. Usually inherited from domain.
- `long_label` (string, optional) - Long field label (max 40 chars). Applied during update step after creation.
- `medium_label` (string, optional) - Medium field label (max 20 chars). Applied during update step after creation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects)
- `search_help` (string, optional) - Search help name. Applied during update step after creation.
- `search_help_parameter` (string, optional) - Search help parameter. Applied during update step after creation.
- `set_get_parameter` (string, optional) - Set/Get parameter ID. Applied during update step after creation.
- `short_label` (string, optional) - Short field label (max 10 chars). Applied during update step after creation.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.
- `type_kind` (string, optional (default: domain)) - Type kind: 'domain' (default), 'predefinedAbapType', 'refToPredefinedAbapType', 'refToDictionaryType', 'refToClifType'. If not specified, defaults to 'domain'.
- `type_name` (string, optional) - Type name: domain name (when type_kind is 'domain'), data element name (when type_kind is 'refToDictionaryType'), or class name (when type_kind is 'refToClifType')

---

<a id="deletedataelement-high-level-data-element"></a>
#### DeleteDataElement (High-Level / Data Element)
**Description:** Delete an ABAP data element from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/data_element/high/handleDeleteDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - Data element name (e.g., Z_MY_DATA_ELEMENT).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getdataelement-high-level-data-element"></a>
#### GetDataElement (High-Level / Data Element)
**Description:** Retrieve ABAP data element definition. Supports reading active or inactive version.

**Source:** `src/handlers/data_element/high/handleGetDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - Data element name (e.g., Z_MY_DATA_ELEMENT).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updatedataelement-high-level-data-element"></a>
#### UpdateDataElement (High-Level / Data Element)
**Description:** Operation: Update, Create. Subject: DataElement. Will be useful for updating or creating data element. Update an existing ABAP data element. Locks, updates with provided parameters (complete replacement), unlocks, and optionally activates.

**Source:** `src/handlers/data_element/high/handleUpdateDataElement.ts`

**Parameters:**
- `activate` (boolean, optional (default: true)) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `data_element_name` (string, required) - Data element name to update (e.g., ZZ_TEST_DTEL_01)
- `data_type` (string, optional) - Data type (CHAR, NUMC, etc.) - for predefinedAbapType or refToPredefinedAbapType
- `decimals` (number, optional) - Decimals - for predefinedAbapType or refToPredefinedAbapType
- `description` (string, optional) - New data element description
- `field_label_heading` (string, optional) - Heading field label (max 55 chars)
- `field_label_long` (string, optional) - Long field label (max 40 chars)
- `field_label_medium` (string, optional) - Medium field label (max 20 chars)
- `field_label_short` (string, optional) - Short field label (max 10 chars)
- `length` (number, optional) - Length - for predefinedAbapType or refToPredefinedAbapType
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects)
- `search_help` (string, optional) - Search help name
- `search_help_parameter` (string, optional) - Search help parameter
- `set_get_parameter` (string, optional) - Set/Get parameter ID
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.
- `type_kind` (string, optional (default: domain)) - Type kind: domain, predefinedAbapType, refToPredefinedAbapType, refToDictionaryType, refToClifType
- `type_name` (string, optional) - Type name: domain name, data element name, or class name (depending on type_kind)

---

<a id="high-level-ddlx"></a>
### High-Level / Ddlx

<a id="checkmetadataextension-high-level-ddlx"></a>
#### CheckMetadataExtension (High-Level / Ddlx)
**Description:** Perform syntax check on an ABAP metadata extension (DDLX). Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/ddlx/high/handleCheckMetadataExtension.ts`

**Parameters:**
- `name` (string, required) - Metadata extension name (e.g., ZC_MY_DDLX).

---

<a id="createmetadataextension-high-level-ddlx"></a>
#### CreateMetadataExtension (High-Level / Ddlx)
**Description:** Operation: Create. Subject: MetadataExtension. Will be useful for creating metadata extension. Create a new ABAP Metadata Extension (DDLX) in SAP system. Creates the metadata extension object in initial state.

**Source:** `src/handlers/ddlx/high/handleCreateMetadataExtension.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after creation. DEFAULT FALSE, and passing true will normally FAIL. 
- `description` (string, optional) - Description
- `name` (string, required) - Metadata Extension name
- `package_name` (string, required) - Package name
- `transport_request` (string, optional) - Transport request number

---

<a id="updatemetadataextension-high-level-ddlx"></a>
#### UpdateMetadataExtension (High-Level / Ddlx)
**Description:** Operation: Update, Create. Subject: MetadataExtension. Will be useful for updating or creating metadata extension. Update source code of an existing ABAP Metadata Extension (DDLX). Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/ddlx/high/handleUpdateMetadataExtension.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `lock_handle` (string, optional) - Lock handle from LockObject. If not provided, will attempt to lock internally.
- `name` (string, required) - Metadata Extension name
- `source_code` (string, required) - New source code
- `transport_request` (string, optional) - Transport request number (required for transportable packages).

---

<a id="high-level-domain"></a>
### High-Level / Domain

<a id="checkdomain-high-level-domain"></a>
#### CheckDomain (High-Level / Domain)
**Description:** Perform syntax check on an ABAP domain. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/domain/high/handleCheckDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., ZDM_MY_DOMAIN).

---

<a id="createdomain-high-level-domain"></a>
#### CreateDomain (High-Level / Domain)
**Description:** Operation: Create. Subject: Domain. Will be useful for creating domain. Create a new ABAP domain in SAP system. Creates the domain object in initial state.

**Source:** `src/handlers/domain/high/handleCreateDomain.ts`

**Parameters:**
- `activate` (boolean, optional (default: true))) - (optional) Activate domain after creation (default: true)
- `conversion_exit` (string, optional) - (optional) Conversion exit routine name (without CONVERSION_EXIT_ prefix)
- `datatype` (string, optional (default: CHAR)) - (optional) Data type: CHAR, NUMC, DATS, TIMS, DEC, INT1, INT2, INT4, INT8, CURR, QUAN, etc.
- `decimals` (number, optional (default: 0)) - (optional) Decimal places (for DEC, CURR, QUAN types)
- `description` (string, optional) - (optional) Domain description. If not provided, domain_name will be used.
- `domain_name` (string, required) - Domain name (e.g., ZZ_TEST_0001). Must follow SAP naming conventions.
- `fixed_values` (array, optional) - (optional) Array of fixed values for domain value range
- `length` (number, optional (default: 100)) - (optional) Field length (max depends on datatype)
- `lowercase` (boolean, optional (default: false)) - (optional) Allow lowercase input
- `package_name` (string, optional) - (optional) Package name (e.g., ZOK_LOCAL, $TMP for local objects)
- `sign_exists` (boolean, optional (default: false)) - (optional) Field has sign (+/-)
- `transport_request` (string, optional) - (optional) Transport request number (e.g., ABCK900001). Required for transportable packages.
- `value_table` (string, optional) - (optional) Value table name for foreign key relationship

---

<a id="deletedomain-high-level-domain"></a>
#### DeleteDomain (High-Level / Domain)
**Description:** Delete an ABAP domain from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/domain/high/handleDeleteDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., Z_MY_DOMAIN).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getdomain-high-level-domain"></a>
#### GetDomain (High-Level / Domain)
**Description:** Retrieve ABAP domain definition. Supports reading active or inactive version.

**Source:** `src/handlers/domain/high/handleGetDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., Z_MY_DOMAIN).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updatedomain-high-level-domain"></a>
#### UpdateDomain (High-Level / Domain)
**Description:** Operation: Update, Create. Subject: Domain. Will be useful for updating or creating domain. Update an existing ABAP domain. Locks, updates with provided parameters (complete replacement), unlocks, and optionally activates.

**Source:** `src/handlers/domain/high/handleUpdateDomain.ts`

**Parameters:**
- `activate` (boolean, optional (default: true)) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `conversion_exit` (string, optional) - Conversion exit routine name (without CONVERSION_EXIT_ prefix)
- `datatype` (string, optional) - Data type: CHAR, NUMC, DATS, TIMS, DEC, INT1, INT2, INT4, INT8, CURR, QUAN, etc.
- `decimals` (number, optional) - Decimal places (for DEC, CURR, QUAN types)
- `description` (string, optional) - New domain description (optional)
- `domain_name` (string, required) - Domain name to update (e.g., ZZ_TEST_0001)
- `fixed_values` (array, optional) - Array of fixed values for domain value range
- `length` (number, optional) - Field length (max depends on datatype)
- `lowercase` (boolean, optional) - Allow lowercase input
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects)
- `sign_exists` (boolean, optional) - Field has sign (+/-)
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.
- `value_table` (string, optional) - Value table name for foreign key relationship

---

<a id="high-level-function"></a>
### High-Level / Function

<a id="checkfunctiongroup-high-level-function"></a>
#### CheckFunctionGroup (High-Level / Function)
**Description:** Perform syntax check on an ABAP function group. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/function/high/handleCheckFunctionGroup.ts`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., ZFGRP_MY_GROUP).

---

<a id="checkfunctionmodule-high-level-function"></a>
#### CheckFunctionModule (High-Level / Function)
**Description:** Perform syntax check on an ABAP function module. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/function/high/handleCheckFunctionModule.ts`

**Parameters:**
- `function_group_name` (string, required) - Function group name containing the function module.
- `function_module_name` (string, required) - Function module name (e.g., Z_MY_FUNCTION).
- `version` (string, optional) - Version to check: 'active' or 'inactive'. Default: active.

---

<a id="createfunctiongroup-high-level-function"></a>
#### CreateFunctionGroup (High-Level / Function)
**Description:** Create a new ABAP function group in SAP system. Function groups serve as containers for function modules. Uses stateful session for proper lock management.

**Source:** `src/handlers/function/high/handleCreateFunctionGroup.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate function group after creation. Default: true. Set to false for batch operations.
- `description` (string, optional) - Function group description. If not provided, function_group_name will be used.
- `function_group_name` (string, required) - Function group name (e.g., ZTEST_FG_001). Must follow SAP naming conventions (start with Z or Y, max 26 chars).
- `package_name` (string, required) - Package name (e.g., ZOK_LAB, $TMP for local objects)
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="createfunctionmodule-high-level-function"></a>
#### CreateFunctionModule (High-Level / Function)
**Description:** Operation: Create. Subject: FunctionModule. Will be useful for creating function module. Create a new ABAP function module within an existing function group. Creates the function module in initial state.

**Source:** `src/handlers/function/high/handleCreateFunctionModule.ts`

**Parameters:**
- `description` (string, optional) - Optional description for the function module
- `function_group_name` (string, required) - Parent function group name (e.g., ZTEST_FG_001)
- `function_module_name` (string, required) - Function module name (e.g., Z_TEST_FUNCTION_001). Must follow SAP naming conventions (start with Z or Y, max 30 chars).
- `processing_type` (string, optional) - SE37 "Processing Type". Defaults to "normal". 
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="updatefunctiongroup-high-level-function"></a>
#### UpdateFunctionGroup (High-Level / Function)
**Description:** Update metadata (description) of an existing ABAP function group. Function groups are containers for function modules and don't have source code to update directly. Uses stateful session with proper lock/unlock mechanism.

**Source:** `src/handlers/function/high/handleUpdateFunctionGroup.ts`

**Parameters:**
- `description` (string, required) - New description for the function group.
- `function_group_name` (string, required) - Function group name (e.g., ZTEST_FG_001). Must exist in the system.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.

---

<a id="updatefunctionmodule-high-level-function"></a>
#### UpdateFunctionModule (High-Level / Function)
**Description:** Operation: Update, Create. Subject: FunctionModule. Will be useful for updating or creating function module. Update source code of an existing ABAP function module. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/function/high/handleUpdateFunctionModule.ts`

**Parameters:**
- `activate` (boolean, optional (default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict)) - Activate after the update. DEFAULT: FALSE — omitting it leaves the object INACTIVE, so pass true explicitly if you want it usable. (Update* tools are not consistent on this default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `function_group_name` (string, required) - Function group name containing the function module (e.g., ZOK_FG_MCP01).
- `function_module_name` (string, required) - Function module name (e.g., Z_TEST_FM_MCP01). Function module must already exist.
- `source_code` (string, required) - Complete ABAP function module source code. Must include FUNCTION statement with parameters and ENDFUNCTION. Example:\n\nFUNCTION Z_TEST_FM\n  IMPORTING\n    VALUE(iv_input) TYPE string\n  EXPORTING\n    VALUE(ev_output) TYPE string.\n  \n  ev_output = iv_input.\nENDFUNCTION.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable function modules.

---

<a id="high-level-function-group"></a>
### High-Level / Function Group

<a id="deletefunctiongroup-high-level-function-group"></a>
#### DeleteFunctionGroup (High-Level / Function Group)
**Description:** Delete an ABAP function group from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/function_group/high/handleDeleteFunctionGroup.ts`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_FUNCTIONGROUP).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getfunctiongroup-high-level-function-group"></a>
#### GetFunctionGroup (High-Level / Function Group)
**Description:** Retrieve ABAP function group definition. Supports reading active or inactive version.

**Source:** `src/handlers/function_group/high/handleGetFunctionGroup.ts`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_FUNCTIONGROUP).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="high-level-function-module"></a>
### High-Level / Function Module

<a id="deletefunctionmodule-high-level-function-module"></a>
#### DeleteFunctionModule (High-Level / Function Module)
**Description:** Delete an ABAP function module from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/function_module/high/handleDeleteFunctionModule.ts`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name containing the function module (e.g., Z_MY_FUNCTIONGROUP).
- `function_module_name` (string, required) - FunctionModule name (e.g., Z_MY_FUNCTIONMODULE).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getfunctionmodule-high-level-function-module"></a>
#### GetFunctionModule (High-Level / Function Module)
**Description:** Retrieve an ABAP function module definition. Supports reading the active or inactive version. NOTE: the containing function GROUP is REQUIRED — ADT addresses a function module as <group>/fmodules/<module>, so there is no lookup by module name alone, so this tool resolves the group itself when you omit it (TFDIR-PNAME with the SAPL prefix removed) and reports which group it used. Passing it explicitly is still faster and avoids a lookup. Historic note — the manual route was: run GetSqlQuery on table TFDIR filtered by FUNCNAME, take PNAME and drop its leading SAPL prefix.

**Source:** `src/handlers/function_module/high/handleGetFunctionModule.ts`

**Parameters:**
- `function_group_name` (string, optional) - Function group containing the module (e.g., Z_MY_FUNCTIONGROUP). OPTIONAL: when 
- `function_module_name` (string, required) - FunctionModule name (e.g., Z_MY_FUNCTIONMODULE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="high-level-generator"></a>
### High-Level / Generator

<a id="generaterepoobjects-high-level-generator"></a>
#### GenerateRepoObjects (High-Level / Generator)
**Description:** Generate a full repository bundle from one DB table using SAP ADT repository generators. Supported types: "uiservice" (OData V4 UI service via RAP — CDS root + BDEF + behavior pool + draft table + projection + service definition + service binding + metadata extension), "webapiservice" (parallel RAP Web API service — no UI specifics), "smbc" (Fiori-based maintenance object for a customizing table). For uiservice / webapiservice the created service binding is fetched and returned alongside the list of generated objects.

**Source:** `src/handlers/generator/high/handleGenerateRepoObjects.ts`

**Parameters:**
- `behavior_implementation_class` (string, optional) - Behavior implementation class (e.g. "ZBP_LEAVE_R23"). Required for uiservice / webapiservice.
- `cds_name` (string, optional) - Root CDS view name (e.g. "ZR_LEAVE_R23"). Required for uiservice / webapiservice.
- `description` (string, optional) - Description applied to the generated objects.
- `draft_table` (string, optional) - Draft table name for the root entity (uiservice only; ignored for webapiservice).
- `maintenance_object_name` (string, optional) - Maintenance object name (e.g. "ZMO_LEAVE_R2"). Required for smbc.
- `master_language` (string, optional (default: EN)) - Master language for new objects (e.g. "EN").
- `package` (string, required) - Target ABAP package for the generated objects (e.g. "$TMP" or "ZLEAVE").
- `reference_object_name` (string, required) - Name of the source DB table (e.g. "ZLEAVE_R2"). The referencedObject query parameter sent to SAP is built as /sap/bc/adt/ddic/tables/<name>.
- `service_binding_name` (string, optional) - Service binding name (e.g. "ZUI_LEAVE_R2_O43"). Required for uiservice / webapiservice.
- `service_binding_type` (string, optional) - Binding type. Defaults to "OData V4 - UI" for uiservice and "OData V4" for webapiservice.
- `service_definition_name` (string, optional) - Service definition name (e.g. "ZUI_LEAVE_R2_O43"). Required for uiservice / webapiservice.
- `service_projection_name` (string, optional) - Service projection name (e.g. "ZC_LEAVE_R23"). Required for uiservice / webapiservice.
- `smbc_description` (string, optional) - Description specifically for the maintenance object (smbc only; falls back to the top-level `description`).
- `transport_request` (string, optional) - Optional CTS transport request (forwarded as corrNr query parameter). Leave empty for $TMP / local packages.
- `type` (string, required) - Which generator to invoke.

---

<a id="high-level-interface"></a>
### High-Level / Interface

<a id="checkinterface-high-level-interface"></a>
#### CheckInterface (High-Level / Interface)
**Description:** Perform syntax check on an ABAP interface. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/interface/high/handleCheckInterface.ts`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., ZIF_MY_INTERFACE).

---

<a id="createinterface-high-level-interface"></a>
#### CreateInterface (High-Level / Interface)
**Description:** Operation: Create. Subject: Interface. Will be useful for creating interface. Create a new ABAP interface in SAP system. Creates the interface object in initial state.

**Source:** `src/handlers/interface/high/handleCreateInterface.ts`

**Parameters:**
- `description` (string, optional) - Interface description. If not provided, interface_name will be used.
- `interface_name` (string, required) - Interface name (e.g., ZIF_TEST_INTERFACE_001). Must follow SAP naming conventions (start with Z or Y).
- `package_name` (string, required) - Package name (e.g., ZOK_LAB, $TMP for local objects)
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deleteinterface-high-level-interface"></a>
#### DeleteInterface (High-Level / Interface)
**Description:** Delete an ABAP interface from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/interface/high/handleDeleteInterface.ts`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_INTERFACE).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getinterface-high-level-interface"></a>
#### GetInterface (High-Level / Interface)
**Description:** Retrieve ABAP interface definition. Supports reading active or inactive version.

**Source:** `src/handlers/interface/high/handleGetInterface.ts`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_INTERFACE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updateinterface-high-level-interface"></a>
#### UpdateInterface (High-Level / Interface)
**Description:** Operation: Update, Create. Subject: Interface. Will be useful for updating or creating interface. Update source code of an existing ABAP interface. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/interface/high/handleUpdateInterface.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `interface_name` (string, required) - Interface name (e.g., ZIF_MY_INTERFACE). Must exist in the system.
- `source_code` (string, required) - Complete ABAP interface source code with INTERFACE...ENDINTERFACE section.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.

---

<a id="high-level-lockobject"></a>
### High-Level / Lockobject

<a id="createlockobject-high-level-lockobject"></a>
#### CreateLockObject (High-Level / Lockobject)
**Description:** Operation: Create. Subject: LockObject (ENQU). Create a new ABAP lock object over a primary table. Activate with ActivateLockObject to generate the ENQUEUE/DEQUEUE function modules.

**Source:** `src/handlers/lockobject/high/handleCreateLockObject.ts`

**Parameters:**
- `allow_rfc` (boolean, optional) - Allow enqueue via RFC. Default: false.
- `description` (string, optional) - Description (defaults to name).
- `lock_mode` (string, optional) - Lock mode for the primary table: E (exclusive, default), S (shared), X (exclusive non-cumulative), O (optimistic).
- `lock_object_name` (string, required) - Lock object name (e.g., EZMY_LOCK). Conventionally starts with E, max 16 chars.
- `package_name` (string, required) - Package name (e.g., $TMP, ZMY_PKG).
- `primary_table` (string, required) - Primary (base) table the lock protects.
- `transport_request` (string, optional) - Transport request (if transportable).

---

<a id="deletelockobject-high-level-lockobject"></a>
#### DeleteLockObject (High-Level / Lockobject)
**Description:** Operation: Delete. Subject: LockObject (ENQU). Delete an ABAP lock object from the SAP system.

**Source:** `src/handlers/lockobject/high/handleDeleteLockObject.ts`

**Parameters:**
- `lock_object_name` (string, required) - Lock object name.
- `transport_request` (string, optional) - Transport request. Required for transportable objects; optional for $TMP.

---

<a id="updatelockobject-high-level-lockobject"></a>
#### UpdateLockObject (High-Level / Lockobject)
**Description:** Operation: Update. Subject: LockObject (ENQU). Update an existing lock object (primary table, lock mode, RFC flag). Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/lockobject/high/handleUpdateLockObject.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `allow_rfc` (boolean, optional) - Allow enqueue via RFC. Default: false.
- `lock_mode` (string, optional) - Lock mode: E (default), S, X, O.
- `lock_object_name` (string, required) - Lock object name (must exist).
- `primary_table` (string, required) - Primary (base) table.
- `transport_request` (string, optional) - Transport request (if transportable).

---

<a id="high-level-messageclass"></a>
### High-Level / Messageclass

<a id="addmessage-high-level-messageclass"></a>
#### AddMessage (High-Level / Messageclass)
**Description:** Operation: Create. Subject: One message in a message class (SE91). Add a single message WITHOUT re-sending the rest of the class — the existing messages are read from SAP and preserved, so they cannot be lost in transit (unlike UpdateMessageClass, which replaces the whole list). Fails if the message number already exists, rather than overwriting a message that is probably already referenced in code.

**Source:** `src/handlers/messageclass/high/handleAddMessage.ts`

**Parameters:**
- `message_class_name` (string, required) - Message class name (e.g., ZMY_MSGCLASS).
- `msgno` (string, required) - 
- `self_explanatory` (boolean, optional) - Whether the message is self-explanatory (no long text needed). Default true.
- `text` (string, required) - Message short text. May contain the placeholders &1 &2 &3 &4. Max 73 characters.
- `transport_request` (string, optional) - Transport request, when the class is in a transportable package.

---

<a id="createmessageclass-high-level-messageclass"></a>
#### CreateMessageClass (High-Level / Messageclass)
**Description:** Operation: Create. Subject: MessageClass. Create a new ABAP message class (MSAG) in initial state. Add messages with UpdateMessageClass.

**Source:** `src/handlers/messageclass/high/handleCreateMessageClass.ts`

**Parameters:**
- `description` (string, optional) - Description (defaults to name).
- `message_class_name` (string, required) - Message class name (e.g., ZMY_MSG). Start with Z or Y, MAX 20 chars.
- `package_name` (string, required) - Package name (e.g., $TMP, ZMY_PKG).
- `transport_request` (string, optional) - Transport request (if transportable).

---

<a id="deletemessageclass-high-level-messageclass"></a>
#### DeleteMessageClass (High-Level / Messageclass)
**Description:** Operation: Delete. Subject: MessageClass. Delete an ABAP message class (MSAG) from the SAP system.

**Source:** `src/handlers/messageclass/high/handleDeleteMessageClass.ts`

**Parameters:**
- `message_class_name` (string, required) - Message class name.
- `transport_request` (string, optional) - Transport request. Required for transportable objects; optional for $TMP.

---

<a id="updatemessage-high-level-messageclass"></a>
#### UpdateMessage (High-Level / Messageclass)
**Description:** Operation: Update. Subject: One message in a message class (SE91). Change a single message’s text or self-explanatory flag, leaving every other message untouched. Fails if the message number does not exist. Pass language to write a TRANSLATION instead: the master-language row is verified unchanged against T100 and the call fails if it moved.

**Notes:** Parallelism. Every write to a message class takes the SAME lock on the WHOLE class, so concurrent UpdateMessage calls against one class queue behind each other rather than running side by side. Measured by a reporting project rewriting 109 texts: 8 calls in parallel completed fine, 15 did not — 2 of the 15 exceeded the client timeout, and those two had NOT been applied. Keep a batch on one class at or below ~8 concurrent calls, or send them sequentially; the wall-clock difference is small because they serialise on the lock either way.  A timeout here is not proof the write failed: the request was sent and SAP may still be holding the lock. Read the message back with GetMessageClass before re-sending. Raise SAP_TIMEOUT_DEFAULT (milliseconds, default 45000) if a class is large enough that single writes are slow.  Translations (the language parameter). Measured end to end on S/4HANA 2023 FPS02, acceptance test = T100 rows per language before and after, never an HTTP status.    * The row a text lands in is decided by the SESSION language, and the session's language is fixed     by the request that OPENS it — the LOCK. sap-language on the PUT alone only changes how the     response is rendered. Proven: on a connection pinned to EN, a lock carrying sap-language=ZH plus     the PUT wrote T100 SPRSL='1' and left SPRSL='E' byte-identical; the; same; PUT; with the lock in EN wrote; ('E'); instead.   * THE TRAP, which; is; why; the; payload; is; one; message; and; not; the; class: a read in the target     language falls back to the MASTER text for every message that has no row there, so writing the     whole list back manufactures a target-language row holding the master text for every     untranslated message. Measured: updating 001 in ZH with the full list created a ZH row for 002     containing its English text. On a 109-message class that is 108 fabricated translations, which     is worse than none because the translation tools then treat them as done. UpdateMessageClass is     an UPSERT, so a one-message payload leaves the others alone — verified: message 003 gained no ZH     row.   * The tool verifies itself against T100 and REFUSES to report success if the master-language row     changed or disappeared. The class read cannot do this: ADT serves the master text when the     language has no row, so a "successful" read is exactly what a failed translation looks like.   * self_explanatory is refused alongside language — the flag belongs to the message, not to one     language. Adding a message in a non-master language is refused for the same reason: create it in     the master language first.  Without language the text is written in the session language, which this server pins to SAP_LANGUAGE (default EN).

**Source:** `src/handlers/messageclass/high/handleUpdateMessage.ts`

**Parameters:**
- `language` (string, optional) - ADT/ISO code (e.g. "ZH", "DE"). Omit for a normal edit. See Notes.
- `message_class_name` (string, required) - Message class name (e.g., ZMY_MSGCLASS).
- `msgno` (string, required) - 
- `self_explanatory` (boolean, optional) - New self-explanatory flag. Omit to keep the current value.
- `text` (string, optional) - New short text. Omit to keep the current text.
- `transport_request` (string, optional) - Transport request, when the class is in a transportable package.

---

<a id="updatemessageclass-high-level-messageclass"></a>
#### UpdateMessageClass (High-Level / Messageclass)
**Description:** Operation: Update. Subject: MessageClass. Create or update several messages of an existing ABAP message class in one call. UPSERT semantics, verified live: messages you pass are created or overwritten, and messages you leave OUT are KEPT (this is NOT a whole-set replace, so nothing is lost by omission — and nothing can be deleted this way either; removing a message needs SE91). To change a single message prefer AddMessage / UpdateMessage, which read the current list from SAP so you never have to resend the others.

**Source:** `src/handlers/messageclass/high/handleUpdateMessageClass.ts`

**Parameters:**
- `message_class_name` (string, required) - Message class name (must exist).
- `messages` (array, required) - Messages to create or update. Messages of this class that are NOT listed here are 
- `transport_request` (string, optional) - Transport request (if transportable).

---

<a id="high-level-metadata-extension"></a>
### High-Level / Metadata Extension

<a id="deletemetadataextension-high-level-metadata-extension"></a>
#### DeleteMetadataExtension (High-Level / Metadata Extension)
**Description:** Delete an ABAP metadata extension from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/metadata_extension/high/handleDeleteMetadataExtension.ts`

**Parameters:**
- `metadata_extension_name` (string, required) - MetadataExtension name (e.g., Z_MY_METADATAEXTENSION).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getmetadataextension-high-level-metadata-extension"></a>
#### GetMetadataExtension (High-Level / Metadata Extension)
**Description:** Retrieve ABAP metadata extension definition. Supports reading active or inactive version.

**Source:** `src/handlers/metadata_extension/high/handleGetMetadataExtension.ts`

**Parameters:**
- `metadata_extension_name` (string, required) - MetadataExtension name (e.g., Z_MY_METADATAEXTENSION).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="high-level-package"></a>
### High-Level / Package

<a id="checkpackage-high-level-package"></a>
#### CheckPackage (High-Level / Package)
**Description:** Perform syntax check on an ABAP package. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/package/high/handleCheckPackage.ts`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., ZMY_PACKAGE).
- `super_package` (string, required) - Super package name (parent package).

---

<a id="createpackage-high-level-package"></a>
#### CreatePackage (High-Level / Package)
**Description:** Create a new ABAP package in SAP system. Packages are containers for development objects and are essential for organizing code.

**Source:** `src/handlers/package/high/handleCreatePackage.ts`

**Parameters:**
- `application_component` (string, optional) - Application component (optional, e.g., BC-ABA)
- `description` (string, optional) - Package description. If not provided, package_name will be used.
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_0002). Must follow SAP naming conventions (start with Z or Y for customer namespace).
- `package_type` (enum, optional (default: development)) - Package type: 'development' (default) or 'structure'
- `record_changes` (boolean, optional) - Enable change recording for the package. Required for transportable packages. Default: false.
- `software_component` (string, optional) - Software component (e.g., HOME, ZLOCAL). If not provided, SAP will set a default (typically ZLOCAL for local packages).
- `super_package` (string, optional) - Parent package name (e.g., ZOK_PACKAGE). Optional — omit for a top-level package; required only for structure packages.
- `transport_layer` (string, optional) - Transport layer (e.g., ZE19). Required for transportable packages.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required if package is transportable.

---

<a id="deletepackage-high-level-package"></a>
#### DeletePackage (High-Level / Package)
**Description:** Operation: Delete. Subject: Package. Delete an ABAP package (DEVC) from the SAP system. The package must be EMPTY — SAP refuses to delete a package that still contains objects, and the refusal reason is relayed verbatim. Transport request required for transportable packages, optional for local ones ($*). NOTE: ADT cannot delete a package that has no TADIR/TDEVC record (a half-created "orphan" package); such a package needs SAP-side cleanup via SE21.

**Source:** `src/handlers/package/high/handleDeletePackage.ts`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., ZMCP_TEST).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900065). Required for transportable packages. Omit for local packages ($*).

---

<a id="getpackage-high-level-package"></a>
#### GetPackage (High-Level / Package)
**Description:** Retrieve ABAP package metadata (description, super-package, etc.). Supports reading active or inactive version.

**Source:** `src/handlers/package/high/handleGetPackage.ts`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., Z_MY_PACKAGE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="high-level-program"></a>
### High-Level / Program

<a id="checkprogram-high-level-program"></a>
#### CheckProgram (High-Level / Program)
**Description:** Perform syntax check on an ABAP program. Returns syntax errors, warnings, and messages. Not available on cloud.

**Source:** `src/handlers/program/high/handleCheckProgram.ts`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., ZMCP_MY_PROGRAM).

---

<a id="createprogram-high-level-program"></a>
#### CreateProgram (High-Level / Program)
**Description:** Operation: Create. Subject: Program. Will be useful for creating program. Create a new ABAP program (report) in SAP system. Creates the program object in initial state.

**Source:** `src/handlers/program/high/handleCreateProgram.ts`

**Parameters:**
- `application` (string, optional) - Application area (e.g., 'S' for System, 'M' for Materials Management). Default: '*'
- `description` (string, optional) - Program description. If not provided, program_name will be used.
- `main_program` (string, optional) - include only: the main program it belongs to (optional).
- `package_name` (string, required) - Package name (e.g., ZOK_LAB, $TMP for local objects)
- `program_name` (string, required) - Program name (e.g., Z_TEST_PROGRAM_001). Must follow SAP naming conventions (start with Z or Y).
- `program_type` (string, optional) - Program type: 'executable' (Report), 'include', 'module_pool', 'function_group', 'class_pool', 'interface_pool'. Default: 'executable'
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deleteprogram-high-level-program"></a>
#### DeleteProgram (High-Level / Program)
**Description:** Delete an ABAP program from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/program/high/handleDeleteProgram.ts`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getprogram-high-level-program"></a>
#### GetProgram (High-Level / Program)
**Description:** Retrieve ABAP program definition. Supports reading active or inactive version.

**Source:** `src/handlers/program/high/handleGetProgram.ts`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updateprogram-high-level-program"></a>
#### UpdateProgram (High-Level / Program)
**Description:** Operation: Update, Create. Subject: Program. Will be useful for updating or creating program. Update source code of an existing ABAP program. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/program/high/handleUpdateProgram.ts`

**Parameters:**
- `activate` (boolean, optional (default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict)) - Activate after the update. DEFAULT: FALSE — omitting it leaves the object INACTIVE, so pass true explicitly if you want it usable. (Update* tools are not consistent on this default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `program_name` (string, required) - Program name (e.g., Z_TEST_PROGRAM_001). Program must already exist.
- `source_code` (string, required) - Complete ABAP program source code.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="updatetextelements-high-level-program"></a>
#### UpdateTextElements (High-Level / Program)
**Description:** Write a program's TEXT-xxx symbols / selection texts (original language), merged by key, then activate; verified by reading the active text pool back. Translations: UpdateTranslation (RPT4).

**Notes:** Protocol (measured on S4D over RFC): lock /sap/bc/adt/textelements/programs/{program}, PUT source/symbols and/or source/selections (each with its own media type), unlock, activate as PROG/PX. The write lands in the INACTIVE text pool; activation makes it active.  ALWAYS THE ORIGINAL LANGUAGE: a ZH-logon session writing an EN-original program changed the EN pool and created no ZH one, so this tool cannot write a translation. Texts containing CJK characters for a program whose original language is not CJK produce a warning — they would replace the original, not add a translation.  mode "merge" (default): the current texts (including changes pending in an inactive version) are read, the keys passed are added or replaced, remove_symbols are deleted, everything else is kept. mode "replace": the parts passed are written exactly as given (omitted symbols are deleted). A selections list replaces/merges selection texts the same way; a part not passed is not touched.  symbols: key = the 3 characters after TEXT- (001, A01). max_length defaults to the existing one or the text length — it is the room SE63 gives translators, so set it larger when a translation will be longer. Text symbols hold at most 132 characters, selection texts 30. A selection text you pass switches its Dictionary reference off unless you pass ddic_reference: true.  activate defaults to true. If an inactive version was already pending, it is activated together with this change and a warning says so. transport_request is required for a transportable program.

**Source:** `src/handlers/program/high/handleUpdateTextElements.ts`

**Parameters:**
- `activate` (boolean, optional) - 
- `mode` (string, optional) - 
- `program_name` (string, required) - Program.
- `remove_symbols` (array, optional) - Keys.
- `selections` (array, optional) - [{"name":"P_FILE","text":"…"}]
- `symbols` (array, optional) - [{"key":"001","text":"…"}]
- `transport_request` (string, optional) - 

---

<a id="high-level-service-binding"></a>
### High-Level / Service Binding

<a id="createservicebinding-high-level-service-binding"></a>
#### CreateServiceBinding (High-Level / Service Binding)
**Description:** Operation: Create. Subject: ServiceBinding. Will be useful for creating service binding. Create a new ABAP service binding in SAP system. Creates the service binding object in initial state.

**Source:** `src/handlers/service_binding/high/handleCreateServiceBinding.ts`

**Parameters:**
- `activate` (boolean, optional (default: true)) - Activate service binding after create. Default: true.
- `binding_variant` (string, optional (default: ODATA_V4_UI)) - Service binding variant. ODATA_V4_UI = OData V4 for Fiori Elements, ODATA_V4_WEB_API = OData V4 Web API, ODATA_V2_UI = OData V2 for Fiori Elements, ODATA_V2_WEB_API = OData V2 Web API.
- `description` (string, optional) - Optional description. Defaults to service_binding_name when omitted.
- `package_name` (string, required) - ABAP package name.
- `response_format` (string, optional (default: xml)) - 
- `service_binding_name` (string, required) - Service binding name.
- `service_definition_name` (string, required) - Referenced service definition name.
- `service_name` (string, optional) - Published service name. Default: service_binding_name if omitted.
- `service_version` (string, optional) - Published service version. Default: 0001.
- `transport_request` (string, optional) - Optional transport request for transport checks.

---

<a id="deleteservicebinding-high-level-service-binding"></a>
#### DeleteServiceBinding (High-Level / Service Binding)
**Description:** Delete ABAP service binding via ADT Business Services endpoint.

**Source:** `src/handlers/service_binding/high/handleDeleteServiceBinding.ts`

**Parameters:**
- `response_format` (string, optional (default: xml)) - 
- `service_binding_name` (string, required) - Service binding name to delete.
- `transport_request` (string, optional) - Optional transport request for deletion transport flow.

---

<a id="getservicebinding-high-level-service-binding"></a>
#### GetServiceBinding (High-Level / Service Binding)
**Description:** Retrieve ABAP service binding source/metadata by name via ADT Business Services endpoint, plus the RESOLVED service root URL (service_root) for a published binding — the path to call for $metadata or an entity set, taken from SAP rather than guessed.

**Notes:** service_root is NOT derived. The binding document itself does not carry a URL, so the handler follows the binding's own OData category link — GET /sap/bc/adt/businessservices/odatav4/{name} ?servicename={declared service name} (Accept application/vnd.sap.adt.businessservices.odatav4.v1+xml), or the odatav2 equivalent with .odatav2.v2+xml — and reports what SAP answers there. The first named srvb:services declaration supplies servicename; only a missing declaration falls back to the binding name. Its first explicitly declared content version supplies serviceversion when present. If that query returns no service URL, the handler makes at most one further GET with the same servicename and no serviceversion. declared_service_version retains the binding's declaration; service_version remains the actual category response value. The binding document's explicit published state takes precedence over the category response, even when SAP returns no URL.  That answer carries odatav4:serviceUrl (the complete root), odatav4:serviceUrlPrefix, odatav4:repositoryId and the entity collections with their isRoot flag. repositoryId is the segment that cannot be guessed: a UI binding resolves to SRVD and an A2X/Web-API binding to SRVD_A2X, so a caller copying the shape of somebody else's URL gets      403 Service '<SRVD>' repository 'SRVD_A2X' is not assigned to group '<binding>'  Measured on S/4HANA 2023 FPS02: an ODATA_V4_WEB_API binding answers repositoryId SRVD_A2X and serviceUrl /sap/opu/odata4/sap/<binding>/srvd_a2x/sap/<service>/0001/. The V2 endpoint answers 200 with empty values for a V4 binding, so the version is taken from the binding's own srvb:binding.  When SAP returns no service URL, service_root is null and service_root_note says why. A failure to resolve it never fails the read — the binding document is still returned, with the reason in service_root_note. Returned URLs are preserved independently of the binding's published state.

**Source:** `src/handlers/service_binding/high/handleGetServiceBinding.ts`

**Parameters:**
- `response_format` (string, optional (default: xml)) - Preferred response format. "json" requests JSON from endpoint, "xml" parses XML payload, "plain" returns raw text.
- `service_binding_name` (string, required) - Service binding name (for example: ZUI_MY_BINDING). Case-insensitive.

---

<a id="listservicebindingtypes-high-level-service-binding"></a>
#### ListServiceBindingTypes (High-Level / Service Binding)
**Description:** List available service binding types (for example ODataV2/ODataV4) from ADT Business Services endpoint.

**Source:** `src/handlers/service_binding/high/handleListServiceBindingTypes.ts`

**Parameters:**
- `response_format` (string, optional (default: xml)) - 

---

<a id="publishservicebinding-high-level-service-binding"></a>
#### PublishServiceBinding (High-Level / Service Binding)
**Description:** Publish the OData service of an activated service binding so it becomes consumable (local service endpoint / gateway registration). Run AFTER ActivateServiceBinding. For OData V2 bindings (e.g. UI_V2) use odata_version "v2" (default) with optional service_name/service_version; for V4 bindings use "v4". Returns the SAP status message (severity + texts).

**Source:** `src/handlers/service_binding/high/handlePublishServiceBinding.ts`

**Parameters:**
- `binding_name` (string, required) - Service binding name (e.g. YUI_MFGR001_001).
- `odata_version` (string, optional) - OData version of the binding. Default: v2.
- `service_name` (string, optional) - V2 only: published service name if it differs from the binding name. Default: binding_name.
- `service_version` (string, optional) - V2 only: service version. Default: 0001.

---

<a id="unpublishservicebinding-high-level-service-binding"></a>
#### UnpublishServiceBinding (High-Level / Service Binding)
**Description:** Unpublish the OData service of a service binding (remove the local service endpoint / gateway registration). Counterpart of PublishServiceBinding; same parameters.

**Source:** `src/handlers/service_binding/high/handleUnpublishServiceBinding.ts`

**Parameters:**
- `binding_name` (string, required) - Service binding name (e.g. YUI_MFGR001_001).
- `odata_version` (string, optional) - OData version of the binding. Default: v2.
- `service_name` (string, optional) - V2 only: published service name if it differs from the binding name. Default: binding_name.
- `service_version` (string, optional) - V2 only: service version. Default: 0001.

---

<a id="updateservicebinding-high-level-service-binding"></a>
#### UpdateServiceBinding (High-Level / Service Binding)
**Description:** Operation: Update, Create. Subject: ServiceBinding. Will be useful for updating or creating service binding. Update publication state of an existing ABAP service binding.

**Source:** `src/handlers/service_binding/high/handleUpdateServiceBinding.ts`

**Parameters:**
- `binding_variant` (string, required (default: ODATA_V4_UI)) - Service binding variant. Determines OData version for publish/unpublish routing.
- `desired_publication_state` (string, required) - Target publication state.
- `response_format` (string, optional (default: xml)) - 
- `service_binding_name` (string, required) - Service binding name to update.
- `service_name` (string, required) - Published service name.
- `service_version` (string, optional) - Published service version. Optional.

---

<a id="validateservicebinding-high-level-service-binding"></a>
#### ValidateServiceBinding (High-Level / Service Binding)
**Description:** Validate service binding parameters (name, service definition, package, version) via ADT validation endpoint.

**Source:** `src/handlers/service_binding/high/handleValidateServiceBinding.ts`

**Parameters:**
- `description` (string, optional) - Optional description used during validation.
- `package_name` (string, optional) - ABAP package for the binding.
- `service_binding_name` (string, required) - Service binding name to validate.
- `service_binding_version` (string, optional) - Service binding version (for example: 1.0).
- `service_definition_name` (string, required) - Service definition linked to binding.

---

<a id="high-level-service-definition"></a>
### High-Level / Service Definition

<a id="createservicedefinition-high-level-service-definition"></a>
#### CreateServiceDefinition (High-Level / Service Definition)
**Description:** Operation: Create. Subject: ServiceDefinition. Will be useful for creating service definition. Create a new ABAP service definition in SAP system. Creates the service definition object in initial state.

**Source:** `src/handlers/service_definition/high/handleCreateServiceDefinition.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate service definition after creation. Default: true.
- `description` (string, optional) - Service definition description. If not provided, service_definition_name will be used.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects)
- `service_definition_name` (string, required) - Service definition name (e.g., ZSD_MY_SERVICE). Must follow SAP naming conventions (start with Z or Y).
- `source_code` (string, optional) - Service definition source code (optional). If not provided, a minimal template will be created.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deleteservicedefinition-high-level-service-definition"></a>
#### DeleteServiceDefinition (High-Level / Service Definition)
**Description:** Delete an ABAP service definition from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/service_definition/high/handleDeleteServiceDefinition.ts`

**Parameters:**
- `service_definition_name` (string, required) - ServiceDefinition name (e.g., Z_MY_SERVICEDEFINITION).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getservicedefinition-high-level-service-definition"></a>
#### GetServiceDefinition (High-Level / Service Definition)
**Description:** Retrieve ABAP service definition definition. Supports reading active or inactive version.

**Source:** `src/handlers/service_definition/high/handleGetServiceDefinition.ts`

**Parameters:**
- `service_definition_name` (string, required) - ServiceDefinition name (e.g., Z_MY_SERVICEDEFINITION).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updateservicedefinition-high-level-service-definition"></a>
#### UpdateServiceDefinition (High-Level / Service Definition)
**Description:** Operation: Update, Create. Subject: ServiceDefinition. Will be useful for updating or creating service definition. Update source code of an existing ABAP service definition. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/service_definition/high/handleUpdateServiceDefinition.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `service_definition_name` (string, required) - Service definition name (e.g., ZSD_MY_SERVICE). Must exist in the system.
- `source_code` (string, required) - Complete service definition source code.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.

---

<a id="high-level-structure"></a>
### High-Level / Structure

<a id="checkstructure-high-level-structure"></a>
#### CheckStructure (High-Level / Structure)
**Description:** Perform syntax check on an ABAP structure. Checks the stored version, or DDL you supply for an existing structure. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/structure/high/handleCheckStructure.ts`

**Parameters:**
- `ddl_code` (string, optional) - Optional: DDL source code to validate instead of the saved version.
- `structure_name` (string, required) - Structure name (e.g., ZST_MY_STRUCTURE).
- `version` (string, optional) - Version to check: 'active' or 'inactive'.

---

<a id="createstructure-high-level-structure"></a>
#### CreateStructure (High-Level / Structure)
**Description:** Operation: Create. Subject: Structure. Will be useful for creating structure. Create a new ABAP structure in SAP system. Creates the structure object in initial state.

**Source:** `src/handlers/structure/high/handleCreateStructure.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate structure after creation. Default: true. Set to false for batch operations (activate multiple objects later).
- `description` (string, optional) - Structure description. If not provided, structure_name will be used.
- `fields` (array, required (default: 0)) - Array of structure fields
- `includes` (array, optional) - Include other structures in this structure
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects)
- `structure_name` (string, required) - Structure name (e.g., ZZ_S_TEST_001). Must follow SAP naming conventions.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deletestructure-high-level-structure"></a>
#### DeleteStructure (High-Level / Structure)
**Description:** Delete an ABAP structure from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/structure/high/handleDeleteStructure.ts`

**Parameters:**
- `structure_name` (string, required) - Structure name (e.g., Z_MY_STRUCTURE).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getstructure-high-level-structure"></a>
#### GetStructure (High-Level / Structure)
**Description:** Retrieve ABAP structure definition. Supports reading active or inactive version.

**Source:** `src/handlers/structure/high/handleGetStructure.ts`

**Parameters:**
- `structure_name` (string, required) - Structure name (e.g., Z_MY_STRUCTURE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updatestructure-high-level-structure"></a>
#### UpdateStructure (High-Level / Structure)
**Description:** Operation: Update, Create. Subject: Structure. Will be useful for updating or creating structure. Update DDL source code of an existing ABAP structure. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/structure/high/handleUpdateStructure.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `ddl_code` (string, required) - Complete DDL source code for structure. Example: '@EndUserText.label : \'My Structure\' @AbapCatalog.tableCategory : #TRANSPARENT define structure zz_s_test_001 { client : abap.clnt not null; id : abap.char(10); name : abap.char(255); }'
- `structure_name` (string, required) - Structure name (e.g., ZZ_S_TEST_001). Structure must already exist.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.

---

<a id="high-level-system"></a>
### High-Level / System

<a id="getpackagetree-high-level-system"></a>
#### GetPackageTree (High-Level / System)
**Description:** [high-level] Retrieve complete package tree structure including subpackages and objects. Returns hierarchical tree with object names, types, and descriptions.

**Source:** `src/handlers/system/high/handleGetPackageTree.ts`

**Parameters:**
- `debug` (boolean, optional (default: false)) - Include diagnostic metadata in response (counts, types, hierarchy info). Default: false
- `include_descriptions` (boolean, optional (default: true)) - Include object descriptions in response. Default: true
- `include_subpackages` (boolean, optional (default: true)) - Include subpackages recursively in the tree. If false, subpackages are shown as first-level objects but not recursively expanded. Default: true
- `max_depth` (integer, optional (default: 5)) - Maximum depth for recursive package traversal. Default: 5
- `package_name` (string, required) - Package name (e.g., "ZMY_PACKAGE")

---

<a id="setprettyprintersettings-high-level-system"></a>
#### SetPrettyPrinterSettings (High-Level / System)
**Description:** Change the system ABAP pretty-printer settings (indentation on/off and keyword style). Note: this is a system-wide setting affecting every subsequent PrettyPrintSource call.

**Source:** `src/handlers/system/high/handleSetPrettyPrinterSettings.ts`

**Parameters:**
- `indentation` (boolean, required) - Enable indentation.
- `style` (string, required) - Keyword style: toLower, toUpper, keywordUpper, keywordLower, keywordAuto, none.

---

<a id="high-level-table"></a>
### High-Level / Table

<a id="checktable-high-level-table"></a>
#### CheckTable (High-Level / Table)
**Description:** Perform syntax check on an ABAP table. Checks the stored version, or DDL you supply for an existing table. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/table/high/handleCheckTable.ts`

**Parameters:**
- `ddl_code` (string, optional) - Optional: DDL source code to validate instead of the saved version.
- `table_name` (string, required) - Table name (e.g., ZMCP_MY_TABLE).
- `version` (string, optional) - Version to check: 'active', 'inactive', or 'new'. Default: active — a table with no inactive version cannot be checked as 'inactive'/'new' (SAP answers "Error while importing object ... from the database").

---

<a id="createtable-high-level-table"></a>
#### CreateTable (High-Level / Table)
**Description:** Operation: Create. Subject: Table. Create a new ABAP transparent table. NOTE ON SHAPE: this creates an EMPTY table shell only — it takes no fields and no activate parameter. Define the columns afterwards with UpdateTable, passing the complete DDL (define table ... { ... }) and activate there. This differs from CreateStructure, which does accept fields[] inline. Table names are capped at 16 characters.

**Source:** `src/handlers/table/high/handleCreateTable.ts`

**Parameters:**
- `description` (string, optional) - Table description for validation and creation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects)
- `table_name` (string, required) - Table name (e.g., ZZ_TEST_TABLE_001). Must follow SAP naming conventions. MAX 16 characters — SAP silently truncates longer names, so an over-long name fails with a misleading "already exists" error.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="createtableindex-high-level-table"></a>
#### CreateTableIndex (High-Level / Table)
**Description:** Operation: Create. Subject: Table secondary index (SE11, DDIC type TABL/DTI). Create a secondary index on a DDIC table: metadata, field list and activation in one call. The index and its table are activated TOGETHER — they are mutually dependent, and an index with no fields makes the table itself fail to activate. Verify the result with GetTableIndexes.

**Source:** `src/handlers/table/high/handleCreateTableIndex.ts`

**Parameters:**
- `buffer_index_only` (boolean, optional) - Index for the ABAP table buffer only, NOT created on the database. Default false. 
- `description` (string, optional) - Short description of the index (max 60 chars).
- `fields` (array, required) - Index fields IN ORDER — the order determines which queries the index serves. 
- `index_id` (string, required) - Index id, max 3 characters (SAP convention), e.g. "VER". The full object name 
- `package_name` (string, optional) - Package for the index object. Defaults to $TMP. Normally the table’s own package.
- `table_name` (string, required) - Table the index belongs to (e.g., ZMY_TABLE).
- `transport_request` (string, optional) - Transport request. Required when the package is transportable.
- `unique` (boolean, optional) - Create a UNIQUE index (DD12L-UNIQUEFLAG). Default false. A unique index is a 

---

<a id="deletetable-high-level-table"></a>
#### DeleteTable (High-Level / Table)
**Description:** Delete an ABAP table from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/table/high/handleDeleteTable.ts`

**Parameters:**
- `table_name` (string, required) - Table name (e.g., Z_MY_TABLE).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="deletetableindex-high-level-table"></a>
#### DeleteTableIndex (High-Level / Table)
**Description:** Operation: Delete. Subject: Table secondary index (SE11, DDIC type TABL/DTI). Delete a secondary index and re-activate its table so the database index is really dropped. The deletion is verified against the system afterwards, so a refusal is reported as a failure and not as success.

**Source:** `src/handlers/table/high/handleDeleteTableIndex.ts`

**Parameters:**
- `index_id` (string, required) - Index id (max 3 characters), e.g. "VER".
- `table_name` (string, required) - Table the index belongs to.
- `transport_request` (string, optional) - Transport request, when the package is transportable.

---

<a id="gettable-high-level-table"></a>
#### GetTable (High-Level / Table)
**Description:** Retrieve ABAP table definition. Supports reading active or inactive version.

**Source:** `src/handlers/table/high/handleGetTable.ts`

**Parameters:**
- `table_name` (string, required) - Table name (e.g., Z_MY_TABLE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="settabletechnicalsettings-high-level-table"></a>
#### SetTableTechnicalSettings (High-Level / Table)
**Description:** Operation: Update. Subject: Table technical settings (SE13). Set a table’s buffering mode, size category, data class or change-logging flag. Only the fields you pass are changed; everything else is preserved. The settings are read back afterwards and the response reports what SAP actually stored. A buffering restriction (e.g. a table with a LOB column) is reported as a WARNING, not a failure, matching what SE13 does.

**Source:** `src/handlers/table/high/handleSetTableTechnicalSettings.ts`

**Parameters:**
- `buffering` (string, optional) - Buffering mode. SAP encodes this as two fields, so this single value sets both: 
- `data_class` (string, optional) - Data class / tablespace category (DD09L-TABART), e.g. APPL0 (master data), 
- `generic_key_fields` (number, optional) - Number of leading key fields forming the generic buffering area. Only meaningful 
- `log_changes` (boolean, optional) - Whether table changes are logged (DD09L-PROTOKOLL). Logging also requires the 
- `size_category` (number, optional) - SE13 size category (0-4+): the expected space requirement of the table.
- `table_name` (string, required) - Table name (e.g., ZMY_TABLE).
- `transport_request` (string, optional) - Transport request. Required when the table is in a transportable package.

---

<a id="updatetable-high-level-table"></a>
#### UpdateTable (High-Level / Table)
**Description:** Operation: Update, Create. Subject: Table. Will be useful for updating or creating table. Update DDL source code of an existing ABAP table. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/table/high/handleUpdateTable.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `ddl_code` (string, required) - Complete DDL source code for table. Example: '@EndUserText.label : \'My Table\' @AbapCatalog.tableCategory : #TRANSPARENT define table ztst_table { key client : abap.clnt not null; key id : abap.char(10); name : abap.char(255); }'
- `table_name` (string, required) - Table name (e.g., ZZ_TEST_TABLE_001). Table must already exist.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.

---

<a id="updatetableindex-high-level-table"></a>
#### UpdateTableIndex (High-Level / Table)
**Description:** Operation: Update. Subject: Table secondary index (SE11, DDIC type TABL/DTI). Change an existing index’s field list, description, uniqueness or buffer-only flag, then activate it together with its table. Only the fields you pass change. NOTE: when `fields` is given it REPLACES the whole field list, because index field order is significant.

**Source:** `src/handlers/table/high/handleUpdateTableIndex.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate the index and its table after the change. Default TRUE — an inactive index 
- `buffer_index_only` (boolean, optional) - New "table buffer only, not on the database" flag.
- `description` (string, optional) - New description.
- `fields` (array, optional) - New field list IN ORDER. REPLACES the existing list entirely. Omit to keep it.
- `index_id` (string, required) - Index id (max 3 characters), e.g. "VER".
- `table_name` (string, required) - Table the index belongs to.
- `transport_request` (string, optional) - Transport request, when the package is transportable.
- `unique` (boolean, optional) - New uniqueness flag.

---

<a id="high-level-tabletype"></a>
### High-Level / Tabletype

<a id="createtabletype-high-level-tabletype"></a>
#### CreateTableType (High-Level / Tabletype)
**Description:** Operation: Create. Subject: Table type (TTYP). Create a new ABAP table type — an internal-table type over a row type — and activate it. Use this for nested line-item fields: create the item table type, then reference it from a structure field via table_ref (CreateStructure). The row type is normally a structure or data element (row_type_kind=dictionaryType, the default); pass built_in_data_type instead for a table of a predefined ABAP type.

**Source:** `src/handlers/tabletype/high/handleCreateTableType.ts`

**Parameters:**
- `access_type` (string, optional) - Table kind: 'standard' (default), 'sorted', 'hashed', 'index' or 'notSpecified'.
- `activate` (boolean, optional) - Activate after creation. Default: true. The reported activated flag is SAP's own verdict, not a copy of this parameter.
- `built_in_data_type` (string, optional) - Built-in ABAP type for the row (e.g., STRING, CHAR, INT4) when row_type_kind is 'predefinedAbapType' / 'refToPredefinedAbapType'. Mutually exclusive with row_type_name.
- `built_in_decimals` (number, optional) - Decimals for built_in_data_type (default 0).
- `built_in_length` (number, optional) - Length for built_in_data_type (default 0).
- `description` (string, optional) - Description (defaults to table_type_name). Max 60 chars.
- `key_components` (array, optional) - Component (field) names forming the primary key, IN ORDER. Required when 
- `package_name` (string, required) - Package name (e.g., $TMP, ZMY_PKG).
- `primary_key_definition` (string, optional) - Primary key definition: 'standard' (default), 'rowType', 'keyComponents' or 
- `primary_key_kind` (string, optional) - Primary key kind: 'nonUnique' (default), 'unique' or 'notSpecified'. A hashed table requires 'unique'.
- `row_type_kind` (string, optional) - How the row type is specified. Default 'dictionaryType' (a structure/table/data element). Use 'predefinedAbapType' together with built_in_data_type for a table of a built-in type (e.g., a table of STRING).
- `row_type_name` (string, optional) - Row type: the DDIC object each table line has — a structure, table or data element (e.g., ZS_ORDER_ITEM). Required unless built_in_data_type is given.
- `table_type_name` (string, required) - Table type name (e.g., ZTT_ORDER_ITEM). Start with Z or Y, max 30 chars.
- `transport_request` (string, optional) - Transport request. Required for transportable packages; leave empty for $TMP.

---

<a id="deletetabletype-high-level-tabletype"></a>
#### DeleteTableType (High-Level / Tabletype)
**Description:** Operation: Delete. Subject: Table type (TTYP). Delete an ABAP table type. Fails with SAP's own reason (and verifies the object is really gone) when the deletion is refused — e.g. while a structure still references the table type.

**Source:** `src/handlers/tabletype/high/handleDeleteTableType.ts`

**Parameters:**
- `table_type_name` (string, required) - Table type name (e.g., ZTT_ORDER_ITEM).
- `transport_request` (string, optional) - Transport request. Required for transportable packages; leave empty for $TMP.

---

<a id="high-level-transaction"></a>
### High-Level / Transaction

<a id="createtransaction-high-level-transaction"></a>
#### CreateTransaction (High-Level / Transaction)
**Description:** Create a report transaction code (SE93 "program and selection screen", optional start variant), verified by reading TSTC/TSTCT/TSTCP/TADIR back. NEEDS an RFC connection and the helper ZMCP_TRAN on the system — if missing, the error says to run SetupTransactionHelper (ask the user first).

**Notes:** Report transactions only (type R): the program must be EXECUTABLE (TRDIR-SUBC 1). Created through RPY_TRANSACTION_INSERT, the module SE93 itself uses, via the RFC-enabled helper Z_MCP_TRAN_CREATE.  Refused BEFORE anything is written: a code outside the customer namespace (Z*, Y*, /ns/) or that already exists; a program that does not exist or is not executable; a selection_screen other than 1000 that the program does not have (a program without screen 1000 — no PARAMETERS yet — is allowed with a warning); a variant that does not exist; a missing package; a transportable package without transport_request, or a request that is missing, released, or not a workbench request/task.  variant: a system variant (CUS&... / SAP&..., checked in client 000) works in every client; any other variant is client-specific and is checked in the current client, with a warning.  The short text is stored in the logon language of the RFC session (reported as language) — that is the transaction's original language.  Verified after creation: TSTC (program, screen, CINFO 80 = report transaction), TSTCT (text), TSTCP (the variant, or none), TADIR (package), and E071 (the request or one of its tasks) when a transport_request is given. dry_run runs every check and creates nothing.

**Source:** `src/handlers/transaction/high/handleCreateTransaction.ts`

**Parameters:**
- `description` (string, required) - Short text, max 36.
- `dry_run` (boolean, optional) - Check only.
- `package_name` (string, required) - 
- `program_name` (string, required) - Executable program.
- `selection_screen` (string, optional) - Default 1000.
- `transaction_code` (string, required) - e.g. ZMM28.
- `transport_request` (string, optional) - 
- `variant` (string, optional) - Start variant (optional).

---

<a id="deletetransaction-high-level-transaction"></a>
#### DeleteTransaction (High-Level / Transaction)
**Description:** Delete a customer transaction code (Z*, Y*, /ns/), verified by reading TSTC/TSTCT/TADIR back. NEEDS an RFC connection and the helper ZMCP_TRAN — if missing, the error says to run SetupTransactionHelper (ask the user first).

**Notes:** Through RPY_TRANSACTION_DELETE (SE93's own delete: TSTC, TSTCT, TSTCP, TSTCA, TSTCC, the authorization defaults USOBT/USOBX, the transport entry). A transaction in a transportable package needs transport_request (the deletion is recorded there). SAP-namespace codes are refused.

**Source:** `src/handlers/transaction/high/handleDeleteTransaction.ts`

**Parameters:**
- `transaction_code` (string, required) - 
- `transport_request` (string, optional) - 

---

<a id="setuptransactionhelper-high-level-transaction"></a>
#### SetupTransactionHelper (High-Level / Transaction)
**Description:** One-time install of the SE93 helper that CreateTransaction / DeleteTransaction need: function group ZMCP_TRAN with two RFC-enabled modules (Z_MCP_TRAN_CREATE / _DELETE), source shipped with this server. WRITES Z CODE INTO THE SAP SYSTEM — ask the user before calling it. Default package $TMP (no transport). Safe to re-run.

**Notes:** Why a Z helper: ADT has no transaction resource, and SE93's own RPY_TRANSACTION_INSERT / RPY_TRANSACTION_DELETE are not RFC-enabled. Same installer as SetupTranslationHelper: an up-to-date helper is left alone unless force:true, a newer one is never downgraded, a same-named module in another function group is refused; verified by TFDIR (RFC-enabled), the ACTIVE source read back through ADT, and an RFC call on a fresh ABAP session. package_name other than $TMP needs transport_request.

**Source:** `src/handlers/transaction/high/handleSetupTransactionHelper.ts`

**Parameters:**
- `force` (boolean, optional) - Rewrite the source even when the installed helper is up to date. Default false.
- `package_name` (string, optional) - Package for a NEW function group. Default $TMP.
- `transport_request` (string, optional) - Transport request, required for a non-$TMP package.

---

<a id="high-level-translation"></a>
### High-Level / Translation

<a id="addtranslationtotransport-high-level-translation"></a>
#### AddTranslationToTransport (High-Level / Translation)
**Description:** Put objects' translations into a transport request so they reach the next system — SE63/SLXT's language transport (LANG entries), e.g. after UpdateTranslation. Verified by reading the request back. NEEDS an RFC connection and the helper ZMCP_LXE on the system — if missing, the error says to run SetupTranslationHelper (ask the user first).

**Notes:** Does what SLXT (RS_LXE_LOG_EXPORT) does for the objects you name, read from the system source: for each LXE_LOG row of the object in that language (written by every SE63 save and by UpdateTranslation), LXE_OBJ_CREATE_TRANSPORT_ENTRY builds the LANG E071/E071K entries — the transport object type is NOT the LXE type (a data element's texts travel as LANG DTED, a domain's as LANG DOMD) — TR_REQ_CHECK_KEY checks the table keys and TR_REQUEST_CHOICE (no dialog) appends them to the request (measured on S4D: the LANG entries land on the request itself, not on a task).  The request must exist, be a REQUEST (not a task), be modifiable, and be a workbench (K) or transport-of-copies (T) request, as in SLXT; create one with CreateTransport. An object with no LXE_LOG row in that language (never saved as a translation, in this translation area) is refused per object (reason not_in_translation_log) rather than recorded empty.  Afterwards the request and its tasks are read back: success only when every entry is found there. Per-object failures are listed in errors with SLXT's own reasons; the call still records the objects that worked (verdict "partial"). dry_run builds and checks the entries, writes nothing.

**Source:** `src/handlers/translation/high/handleAddTranslationToTransport.ts`

**Parameters:**
- `dry_run` (boolean, optional) - Check only, write nothing.
- `language` (string, required) - Translation language: zhCN (LXE), ZH (ISO) or 1.
- `objects` (array, required) - e.g. [{"object_type":"DTEL","object_name":"ZMY_DE"}]
- `translation_area` (string, optional) - 
- `transport_request` (string, required) - Modifiable workbench request, e.g. ABCK900001.

---

<a id="setuptranslationhelper-high-level-translation"></a>
#### SetupTranslationHelper (High-Level / Translation)
**Description:** One-time install of the SE63 helper that GetTranslation / UpdateTranslation / AddTranslationToTransport need: function group ZMCP_LXE with three RFC-enabled modules (Z_MCP_LXE_READ / _WRITE / _RECORD), source shipped with this server. WRITES Z CODE INTO THE SAP SYSTEM — ask the user before calling it. Default package $TMP (no transport). Safe to re-run: an up-to-date helper is left alone, an outdated one is updated.

**Notes:** Why a Z helper: SE63 reads/writes through LXE_OBJ_TEXT_PAIR_READ / LXE_OBJ_TEXT_PAIR_WRITE, which are not RFC-enabled, and ADT has no resource for them.  Steps: check (over RFC) whether both modules answer with this server's helper version — if so, nothing is changed unless force:true. Otherwise create the function group if missing, create each module (processing type Remote-Enabled) if missing, write the shipped source and activate. A module of the same name in ANOTHER function group is refused, not overwritten.  Verified, not assumed: TFDIR must list both modules in SAPLZMCP_LXE with FMODE R, and over RFC both must return the expected helper version after the ABAP session is reset (a session that had already loaded the old function group would otherwise keep answering with it).  package_name other than $TMP needs transport_request. The function group's package is not changed when it already exists.

**Source:** `src/handlers/translation/high/handleSetupTranslationHelper.ts`

**Parameters:**
- `force` (boolean, optional) - Rewrite the source even when the installed helper is up to date. Default false.
- `package_name` (string, optional) - Package for a NEW function group. Default $TMP.
- `transport_request` (string, optional) - Transport request, required for a non-$TMP package.

---

<a id="updatetranslation-high-level-translation"></a>
#### UpdateTranslation (High-Level / Translation)
**Description:** Write one object's SE63 translation (e.g. DTEL labels) as SE63 saves it. Only the passed keys change; the original language is refused; verified by read-back; not transported. NEEDS an RFC connection and the helper ZMCP_LXE on the system — if missing, the error says to run SetupTranslationHelper (ask the user first). Keys: GetTranslation.

**Notes:** Writes through LXE_OBJ_TEXT_PAIR_WRITE, the module SE63 saves with, via the RFC-enabled helper Z_MCP_LXE_WRITE. For a data element this writes the ACTIVE DD04T row of the target language directly: no inactive version, no activation, the master-language row is not touched (the ADT data-element PUT cannot do this — it edits the master language only).  Refused BEFORE anything is written: no S_TRANSLAT (ACTVT 02) authorization for the target language; target = the object's ORIGINAL language (that is an edit of the object, use the object's own Update* tool); a key the object does not have (the error lists the valid keys); a text longer than max_length (from GetTranslation — for a data element it is the label length declared in DD04L, which can be shorter than the field type); lower case on an upper-case-only key.  Keys not passed keep their current translation (the helper reads all pairs and merges). After writing, the helper reads the object back; success only when every passed text is in the read-back. dry_run runs every check and writes nothing.  The source language is always the object's original language. Short language codes (ZH, EN, 1, E) expand to one LXE variant (ZH -> zhCN), reported as language / language_requested.  Transport: saving writes one LXE_LOG row (translation area, language, type, name, user), like SE63. No request is touched; AddTranslationToTransport (or SLXT) then puts it on a LANG request.

**Source:** `src/handlers/translation/high/handleUpdateTranslation.ts`

**Parameters:**
- `dry_run` (boolean, optional) - Check only, write nothing.
- `language` (string, required) - Target language: zhCN (LXE), ZH (ISO) or 1 (SAP key).
- `object_name` (string, required) - Object name.
- `object_type` (string, required) - LXE type: DTEL, DOMA, TABT, TRAN, …
- `texts` (array, required) - e.g. [{"key":"SCRTEXT_M","text":"销售订单"}]
- `translation_area` (string, optional) - 

---

<a id="high-level-transport"></a>
### High-Level / Transport

<a id="addtransportuser-high-level-transport"></a>
#### AddTransportUser (High-Level / Transport)
**Description:** Add a user to a transport request (creates a new task owned by that user under the request).

**Source:** `src/handlers/transport/high/handleAddTransportUser.ts`

**Parameters:**
- `transport_number` (string, required) - Transport request number, e.g. ABCK900001.
- `user` (string, required) - SAP user name to add as a task owner.

---

<a id="createtransport-high-level-transport"></a>
#### CreateTransport (High-Level / Transport)
**Description:** Create a new ABAP transport request in SAP system for development objects.

**Source:** `src/handlers/transport/high/handleCreateTransport.ts`

**Parameters:**
- `description` (string, required) - Transport request description (mandatory)
- `owner` (string, optional) - Transport owner (optional, defaults to current user)
- `target_system` (string, optional) - Target system for transport (optional, e.g., 'PRD', 'QAS'). If not provided or empty, uses 'LOCAL'
- `transport_type` (string, optional (default: workbench)) - Transport type: 'workbench' (cross-client) or 'customizing' (client-specific)

---

<a id="deletetransport-high-level-transport"></a>
#### DeleteTransport (High-Level / Transport)
**Description:** Delete a modifiable (not yet released) transport request. Fails if the request has already been released.

**Source:** `src/handlers/transport/high/handleDeleteTransport.ts`

**Parameters:**
- `transport_number` (string, required) - Transport request number to delete, e.g. ABCK900001.

---

<a id="mergetransport-high-level-transport"></a>
#### MergeTransport (High-Level / Transport)
**Description:** Merge a transport request into another (SE10 Merge Requests): the source request's tasks and objects move under the target and the source request is deleted. Verified by reading both requests back.

**Notes:** Preconditions enforced by SAP (TR_MERGE_REQUESTS): the source must be a modifiable request owned by the current user; the target must be a modifiable REQUEST (not a task); both must have the same type (workbench/customizing), the same target system and differ from each other.  The tasks keep their own descriptions, so a request created with a per-requirement description and merged into a project-wide request still shows that description on its task.  verdict: "merged" = every task of the source is now under the target and the source is gone; "not_merged" = the read-back contradicts the merge; "unverified" = the call returned without error but the end state could not be read.

**Source:** `src/handlers/transport/high/handleMergeTransport.ts`

**Parameters:**
- `source_transport` (string, required) - Request to merge AWAY (it is deleted), e.g. ABCK900001. Must be owned by the current user.
- `target_transport` (string, required) - Request to merge INTO, e.g. ABCK900002.

---

<a id="releasetransport-high-level-transport"></a>
#### ReleaseTransport (High-Level / Transport)
**Description:** Release a transport request (irreversible — the request can no longer be changed afterwards). Optionally ignore locks or ATC objections. Returns the release report(s) with status and messages.

**Source:** `src/handlers/transport/high/handleReleaseTransport.ts`

**Parameters:**
- `ignore_atc` (boolean, optional) - Release ignoring ATC objections. Default: false.
- `ignore_locks` (boolean, optional) - Release even if objects are locked. Default: false.
- `transport_number` (string, required) - Transport request number, e.g. ABCK900001.

---

<a id="settransportowner-high-level-transport"></a>
#### SetTransportOwner (High-Level / Transport)
**Description:** Change the owner of a transport request to another user.

**Source:** `src/handlers/transport/high/handleSetTransportOwner.ts`

**Parameters:**
- `owner` (string, required) - New owner (SAP user name).
- `transport_number` (string, required) - Transport request number, e.g. ABCK900001.

---

<a id="high-level-unit-test"></a>
### High-Level / Unit Test

<a id="createcdsunittest-high-level-unit-test"></a>
#### CreateCdsUnitTest (High-Level / Unit Test)
**Description:** Create a CDS unit test class with CDS validation. Creates the test class in initial state.

**Source:** `src/handlers/unit_test/high/handleCreateCdsUnitTest.ts`

**Parameters:**
- `cds_view_name` (string, required) - CDS view name to validate for unit test doubles.
- `class_name` (string, required) - Global test class name (e.g., ZCL_CDS_TEST).
- `description` (string, optional) - Optional description for the global test class.
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_PKG_01, $TMP).
- `transport_request` (string, optional) - Transport request number (required for transportable packages).

---

<a id="createunittest-high-level-unit-test"></a>
#### CreateUnitTest (High-Level / Unit Test)
**Description:** Start an ABAP Unit test run for provided class test definitions. Returns run_id for status/result queries.

**Source:** `src/handlers/unit_test/high/handleCreateUnitTest.ts`

**Parameters:**
- `context` (string, optional) - Optional context string shown in SAP tools.
- `duration` (object, optional) - 
- `risk_level` (object, optional) - 
- `scope` (object, optional) - 
- `tests` (array, required) - List of container/test class pairs to execute.
- `title` (string, optional) - Optional title for the ABAP Unit run.

---

<a id="deletecdsunittest-high-level-unit-test"></a>
#### DeleteCdsUnitTest (High-Level / Unit Test)
**Description:** Delete a CDS unit test class (global class).

**Source:** `src/handlers/unit_test/high/handleDeleteCdsUnitTest.ts`

**Parameters:**
- `class_name` (string, required) - Global test class name (e.g., ZCL_CDS_TEST).
- `transport_request` (string, optional) - Transport request number (required for transportable packages).

---

<a id="deleteunittest-high-level-unit-test"></a>
#### DeleteUnitTest (High-Level / Unit Test)
**Description:** Delete an ABAP Unit test run. Note: ADT does not support deleting unit test runs and will return an error.

**Source:** `src/handlers/unit_test/high/handleDeleteUnitTest.ts`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by CreateUnitTest/RunUnitTest.

---

<a id="getcdsunittest-high-level-unit-test"></a>
#### GetCdsUnitTest (High-Level / Unit Test)
**Description:** Retrieve CDS unit test run status and result for a previously started run_id.

**Source:** `src/handlers/unit_test/high/handleGetCdsUnitTest.ts`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by unit test run.

---

<a id="getcdsunittestresult-high-level-unit-test"></a>
#### GetCdsUnitTestResult (High-Level / Unit Test)
**Description:** Retrieve CDS unit test run result for a run_id.

**Source:** `src/handlers/unit_test/high/handleGetCdsUnitTestResult.ts`

**Parameters:**
- `format` (string, optional) - Result format: abapunit or junit.
- `run_id` (string, required) - Run identifier returned by unit test run.
- `with_navigation_uris` (boolean, optional (default: false)) - Include navigation URIs in result if supported.

---

<a id="getcdsunitteststatus-high-level-unit-test"></a>
#### GetCdsUnitTestStatus (High-Level / Unit Test)
**Description:** Retrieve CDS unit test run status for a run_id.

**Source:** `src/handlers/unit_test/high/handleGetCdsUnitTestStatus.ts`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by unit test run.
- `with_long_polling` (boolean, optional (default: true)) - Enable long polling while waiting for status.

---

<a id="getunittest-high-level-unit-test"></a>
#### GetUnitTest (High-Level / Unit Test)
**Description:** Retrieve ABAP Unit test run status and result for a previously started run_id. NOTE: on modern systems RunUnitTest/CreateUnitTest already return the full result synchronously (in the "result" field) — this run_id lookup targets the legacy async run and is generally not needed.

**Source:** `src/handlers/unit_test/high/handleGetUnitTest.ts`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by RunUnitTest.

---

<a id="getunittestresult-high-level-unit-test"></a>
#### GetUnitTestResult (High-Level / Unit Test)
**Description:** Retrieve ABAP Unit test run result for a run_id. NOTE: RunUnitTest/CreateUnitTest return the result synchronously on modern systems; this targets the legacy async run and is generally not needed.

**Source:** `src/handlers/unit_test/high/handleGetUnitTestResult.ts`

**Parameters:**
- `format` (string, optional) - Result format: abapunit or junit.
- `run_id` (string, required) - Run identifier returned by unit test run.
- `with_navigation_uris` (boolean, optional (default: false)) - Include navigation URIs in result if supported.

---

<a id="getunitteststatus-high-level-unit-test"></a>
#### GetUnitTestStatus (High-Level / Unit Test)
**Description:** Retrieve ABAP Unit test run status for a run_id. NOTE: RunUnitTest/CreateUnitTest return results synchronously on modern systems; this targets the legacy async run and is generally not needed.

**Source:** `src/handlers/unit_test/high/handleGetUnitTestStatus.ts`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by unit test run.
- `with_long_polling` (boolean, optional (default: true)) - Enable long polling while waiting for status.

---

<a id="rununittest-high-level-unit-test"></a>
#### RunUnitTest (High-Level / Unit Test)
**Description:** Start an ABAP Unit test run for provided class test definitions. Returns run_id for status/result queries.

**Source:** `src/handlers/unit_test/high/handleRunUnitTest.ts`

**Parameters:**
- `context` (string, optional) - Optional context string shown in SAP tools.
- `duration` (object, optional) - 
- `full` (boolean, optional) - Alias for summary:false — return the complete per-method result tree, including 
- `risk_level` (object, optional) - 
- `scope` (object, optional) - 
- `summary` (boolean, optional) - Return counts and FAILURES only, dropping the per-method detail of tests that 
- `tests` (array, required) - List of container/test class pairs to execute.
- `title` (string, optional) - Optional title for the ABAP Unit run.

---

<a id="updatecdsunittest-high-level-unit-test"></a>
#### UpdateCdsUnitTest (High-Level / Unit Test)
**Description:** Update a CDS unit test class local test class source code.

**Source:** `src/handlers/unit_test/high/handleUpdateCdsUnitTest.ts`

**Parameters:**
- `class_name` (string, required) - Global test class name (e.g., ZCL_CDS_TEST).
- `test_class_source` (string, required) - Updated local test class ABAP source code.
- `transport_request` (string, optional) - Transport request number (required for transportable packages).

---

<a id="updateunittest-high-level-unit-test"></a>
#### UpdateUnitTest (High-Level / Unit Test)
**Description:** Update an ABAP Unit test run. Note: ADT does not support updating unit test runs and will return an error.

**Source:** `src/handlers/unit_test/high/handleUpdateUnitTest.ts`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by CreateUnitTest/RunUnitTest.

---

<a id="high-level-view"></a>
### High-Level / View

<a id="checkview-high-level-view"></a>
#### CheckView (High-Level / View)
**Description:** Perform syntax check on an ABAP CDS view. Checks the stored version, or DDL you supply for an existing view. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/view/high/handleCheckView.ts`

**Parameters:**
- `ddl_source` (string, optional) - Optional: DDL source code to validate instead of the saved version.
- `version` (string, optional) - Version to check: 'active' or 'inactive'.
- `view_name` (string, required) - CDS view name (e.g., ZI_MY_VIEW).

---

<a id="createview-high-level-view"></a>
#### CreateView (High-Level / View)
**Description:** Operation: Create. Subject: CDS view (DDLS). Create a new CDS DDL source. IMPORTANT: this always POSTs to /sap/bc/adt/ddic/ddl/sources and therefore produces a CDS DDL SOURCE — a CLASSIC DDIC database view (VIEW/DV) CANNOT be created with this tool; use SE11 for that. NOTE ON SHAPE: this creates an EMPTY source only — write the actual "define view entity ..." with UpdateView (which defaults to activate:FALSE, so pass activate:true or activate later with ActivateObjects).

**Source:** `src/handlers/view/high/handleCreateView.ts`

**Parameters:**
- `description` (string, optional) - Optional description (defaults to view_name).
- `package_name` (string, required) - Package name (e.g., ZOK_LAB, $TMP for local objects)
- `transport_request` (string, optional) - Transport request number (required for transportable packages).
- `view_name` (string, required) - View name (e.g., ZOK_R_TEST_0002, Z_I_MY_VIEW).

---

<a id="deleteview-high-level-view"></a>
#### DeleteView (High-Level / View)
**Description:** Delete an ABAP view from the SAP system. Includes deletion check before actual deletion. Transport request optional for $TMP objects.

**Source:** `src/handlers/view/high/handleDeleteView.ts`

**Parameters:**
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).
- `view_name` (string, required) - View name (e.g., Z_MY_VIEW).

---

<a id="getview-high-level-view"></a>
#### GetView (High-Level / View)
**Description:** Retrieve an ABAP view definition (CDS DDL source or classic view). Supports reading the active or inactive version. IMPORTANT: pass the DDL SOURCE object name, which is often NOT the CDS entity name — a source ZI_ORDER may define entity ZI_ORDER_E, and passing the entity name returns 404. Use SearchObject with type DDLS to find the source name.

**Source:** `src/handlers/view/high/handleGetView.ts`

**Parameters:**
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.
- `view_name` (string, required) - DDL SOURCE object name (e.g., Z_MY_VIEW) — not the CDS entity name defined inside it. The two frequently differ; using the entity name gives 404.

---

<a id="updateview-high-level-view"></a>
#### UpdateView (High-Level / View)
**Description:** Operation: Update, Create. Subject: View. Will be useful for updating or creating view. Update DDL source code of an existing CDS View or Classic View. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/view/high/handleUpdateView.ts`

**Parameters:**
- `activate` (boolean, optional (default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict)) - Activate after the update. DEFAULT: FALSE — omitting it leaves the object INACTIVE, so pass true explicitly if you want it usable. (Update* tools are not consistent on this default: DDIC tools such as UpdateTable / UpdateStructure default to true.) The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `ddl_source` (string, required) - Complete DDL source code.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.
- `view_name` (string, required) - View name (e.g., ZOK_R_TEST_0002).

---

<a id="high-level-xslt"></a>
### High-Level / Xslt

<a id="createxslt-high-level-xslt"></a>
#### CreateXslt (High-Level / Xslt)
**Description:** Operation: Create. Subject: Transformation (XSLT/ST). Create a new ABAP transformation in initial state. Choose transformation_type: XSLTProgram (XSLT, default) or SimpleTransformation (ST). Set the source with UpdateXslt.

**Source:** `src/handlers/xslt/high/handleCreateXslt.ts`

**Parameters:**
- `description` (string, optional) - Description (defaults to xslt_name).
- `package_name` (string, required) - Package name (e.g., $TMP, ZMY_PKG).
- `transformation_type` (string, optional) - Transformation kind: 'XSLTProgram' (XSLT, default) or 'SimpleTransformation' (ST, source starts with <?sap.transform simple?>).
- `transport_request` (string, optional) - Transport request. Required for transportable packages.
- `xslt_name` (string, required) - Transformation name (e.g., ZMY_XSLT). Start with Z or Y, max 30 chars.

---

<a id="deletexslt-high-level-xslt"></a>
#### DeleteXslt (High-Level / Xslt)
**Description:** Operation: Delete. Subject: Transformation (XSLT). Delete an ABAP transformation from the SAP system.

**Source:** `src/handlers/xslt/high/handleDeleteXslt.ts`

**Parameters:**
- `transport_request` (string, optional) - Transport request. Required for transportable objects; optional for $TMP.
- `xslt_name` (string, required) - Transformation name.

---

<a id="updatexslt-high-level-xslt"></a>
#### UpdateXslt (High-Level / Xslt)
**Description:** Operation: Update. Subject: Transformation (XSLT). Update the source of an existing ABAP transformation. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/xslt/high/handleUpdateXslt.ts`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `source_code` (string, required) - Complete XSLT / Simple Transformation source.
- `transport_request` (string, optional) - Transport request (if transportable).
- `xslt_name` (string, required) - Transformation name (must exist).

---

*Last updated: 2026-11-09*
