# Legacy System Tools - MCP ABAP ADT Server

Generated from code in `src/handlers/**` (not from docs).

Tools available on legacy SAP systems (BASIS < 7.50).
Legacy systems support a subset of tools — primarily Class, Interface, View, Program, Function Group/Module, Package (read/update/delete), Include, Unit Test, and common utilities.

- Total tools: 163
- Read-Only: 18
- High-Level: 82
- Low-Level: 63

## Navigation

- [Read-Only Group](#read-only-group)
  - [Class](#read-only-class)
    - [GetClassMethod](#getclassmethod-read-only-class)
    - [GetClassMethods](#getclassmethods-read-only-class)
    - [ReadClass](#readclass-read-only-class)
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
  - [Package](#read-only-package)
    - [GetPackageContents](#getpackagecontents-read-only-package)
    - [ReadPackage](#readpackage-read-only-package)
  - [Program](#read-only-program)
    - [GetTextElements](#gettextelements-read-only-program)
    - [ReadProgram](#readprogram-read-only-program)
  - [System](#read-only-system)
    - [SearchSource](#searchsource-read-only-system)
  - [Translation](#read-only-translation)
    - [GetTranslation](#gettranslation-read-only-translation)
  - [View](#read-only-view)
    - [ReadView](#readview-read-only-view)
  - [Xslt](#read-only-xslt)
    - [GetXslt](#getxslt-read-only-xslt)
- [High-Level Group](#high-level-group)
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
    - [HandlerCreate](#handlercreate-high-level-compact)
    - [HandlerDelete](#handlerdelete-high-level-compact)
    - [HandlerGet](#handlerget-high-level-compact)
    - [HandlerUpdate](#handlerupdate-high-level-compact)
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
  - [Package](#high-level-package)
    - [CheckPackage](#checkpackage-high-level-package)
    - [DeletePackage](#deletepackage-high-level-package)
    - [GetPackage](#getpackage-high-level-package)
  - [Program](#high-level-program)
    - [CheckProgram](#checkprogram-high-level-program)
    - [CreateProgram](#createprogram-high-level-program)
    - [DeleteProgram](#deleteprogram-high-level-program)
    - [GetProgram](#getprogram-high-level-program)
    - [UpdateProgram](#updateprogram-high-level-program)
    - [UpdateTextElements](#updatetextelements-high-level-program)
  - [Transaction](#high-level-transaction)
    - [CreateTransaction](#createtransaction-high-level-transaction)
    - [DeleteTransaction](#deletetransaction-high-level-transaction)
    - [SetupTransactionHelper](#setuptransactionhelper-high-level-transaction)
  - [Translation](#high-level-translation)
    - [AddTranslationToTransport](#addtranslationtotransport-high-level-translation)
    - [SetupTranslationHelper](#setuptranslationhelper-high-level-translation)
    - [UpdateTranslation](#updatetranslation-high-level-translation)
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
- [Low-Level Group](#low-level-group)
  - [Class](#low-level-class)
    - [ActivateClassLow](#activateclasslow-low-level-class)
    - [ActivateClassTestClassesLow](#activateclasstestclasseslow-low-level-class)
    - [CheckClassLow](#checkclasslow-low-level-class)
    - [CreateClassLow](#createclasslow-low-level-class)
    - [DeleteClassLow](#deleteclasslow-low-level-class)
    - [GetClassUnitTestResultLow](#getclassunittestresultlow-low-level-class)
    - [GetClassUnitTestStatusLow](#getclassunitteststatuslow-low-level-class)
    - [LockClassLow](#lockclasslow-low-level-class)
    - [LockClassTestClassesLow](#lockclasstestclasseslow-low-level-class)
    - [RunClassUnitTestsLow](#runclassunittestslow-low-level-class)
    - [UnlockClassLow](#unlockclasslow-low-level-class)
    - [UnlockClassTestClassesLow](#unlockclasstestclasseslow-low-level-class)
    - [UpdateClassLow](#updateclasslow-low-level-class)
    - [UpdateClassTestClassesLow](#updateclasstestclasseslow-low-level-class)
    - [ValidateClassLow](#validateclasslow-low-level-class)
  - [Common](#low-level-common)
    - [ActivateObjectLow](#activateobjectlow-low-level-common)
    - [DeleteObjectLow](#deleteobjectlow-low-level-common)
  - [Function](#low-level-function)
    - [ActivateFunctionGroupLow](#activatefunctiongrouplow-low-level-function)
    - [ActivateFunctionModuleLow](#activatefunctionmodulelow-low-level-function)
    - [CheckFunctionGroupLow](#checkfunctiongrouplow-low-level-function)
    - [CheckFunctionModuleLow](#checkfunctionmodulelow-low-level-function)
    - [CreateFunctionGroupLow](#createfunctiongrouplow-low-level-function)
    - [CreateFunctionModuleLow](#createfunctionmodulelow-low-level-function)
    - [DeleteFunctionGroupLow](#deletefunctiongrouplow-low-level-function)
    - [DeleteFunctionModuleLow](#deletefunctionmodulelow-low-level-function)
    - [LockFunctionGroupLow](#lockfunctiongrouplow-low-level-function)
    - [LockFunctionModuleLow](#lockfunctionmodulelow-low-level-function)
    - [UnlockFunctionGroupLow](#unlockfunctiongrouplow-low-level-function)
    - [UnlockFunctionModuleLow](#unlockfunctionmodulelow-low-level-function)
    - [UpdateFunctionModuleLow](#updatefunctionmodulelow-low-level-function)
    - [ValidateFunctionGroupLow](#validatefunctiongrouplow-low-level-function)
    - [ValidateFunctionModuleLow](#validatefunctionmodulelow-low-level-function)
  - [Interface](#low-level-interface)
    - [ActivateInterfaceLow](#activateinterfacelow-low-level-interface)
    - [CheckInterfaceLow](#checkinterfacelow-low-level-interface)
    - [CreateInterfaceLow](#createinterfacelow-low-level-interface)
    - [DeleteInterfaceLow](#deleteinterfacelow-low-level-interface)
    - [LockInterfaceLow](#lockinterfacelow-low-level-interface)
    - [UnlockInterfaceLow](#unlockinterfacelow-low-level-interface)
    - [UpdateInterfaceLow](#updateinterfacelow-low-level-interface)
    - [ValidateInterfaceLow](#validateinterfacelow-low-level-interface)
  - [Lockobject](#low-level-lockobject)
    - [ActivateLockObject](#activatelockobject-low-level-lockobject)
  - [Package](#low-level-package)
    - [CheckPackageLow](#checkpackagelow-low-level-package)
    - [DeletePackageLow](#deletepackagelow-low-level-package)
    - [LockPackageLow](#lockpackagelow-low-level-package)
    - [UnlockPackageLow](#unlockpackagelow-low-level-package)
    - [UpdatePackageLow](#updatepackagelow-low-level-package)
  - [Program](#low-level-program)
    - [ActivateProgramLow](#activateprogramlow-low-level-program)
    - [CheckProgramLow](#checkprogramlow-low-level-program)
    - [CreateProgramLow](#createprogramlow-low-level-program)
    - [DeleteProgramLow](#deleteprogramlow-low-level-program)
    - [LockProgramLow](#lockprogramlow-low-level-program)
    - [UnlockProgramLow](#unlockprogramlow-low-level-program)
    - [UpdateProgramLow](#updateprogramlow-low-level-program)
    - [ValidateProgramLow](#validateprogramlow-low-level-program)
  - [View](#low-level-view)
    - [ActivateViewLow](#activateviewlow-low-level-view)
    - [CheckViewLow](#checkviewlow-low-level-view)
    - [CreateViewLow](#createviewlow-low-level-view)
    - [DeleteViewLow](#deleteviewlow-low-level-view)
    - [LockViewLow](#lockviewlow-low-level-view)
    - [UnlockViewLow](#unlockviewlow-low-level-view)
    - [UpdateViewLow](#updateviewlow-low-level-view)
    - [ValidateViewLow](#validateviewlow-low-level-view)
  - [Xslt](#low-level-xslt)
    - [ActivateXslt](#activatexslt-low-level-xslt)

---

<a id="read-only-group"></a>
## Read-Only Group

<a id="read-only-class"></a>
### Read-Only / Class

<a id="getclassmethod-read-only-class"></a>
#### GetClassMethod (Read-Only / Class)
**Description:** [read-only] Read ONE method's implementation (signature line + body), not the whole class. Use GetClassMethods first to find the exact method_name. A method not found returns every method name the class has, instead of a bare error.

**Source:** `src/handlers/class/readonly/handleGetClassMethod.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `method_name` (string, required) - Method name, case-insensitive. Interface-implementation methods use the ABAP form "if_x~method_name".
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="getclassmethods-read-only-class"></a>
#### GetClassMethods (Read-Only / Class)
**Description:** [read-only] List a class's methods (name, visibility, static/redefinition flags, line range, whether it has a body) WITHOUT returning the full source. Use this before UpdateClassMethod to find the exact method_name to target — avoids downloading a whole class just to locate one method.

**Source:** `src/handlers/class/readonly/handleGetClassMethods.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="readclass-read-only-class"></a>
#### ReadClass (Read-Only / Class)
**Description:** Operation: Read, Create, Update. Subject: Class. Will be useful for reading, creating, or updating class. [read-only] Read ABAP class source code and metadata. Answers: "show class code", "display class source", "view class definition/implementation", "get class X". Returns source code, package, responsible, description.

**Source:** `src/handlers/class/readonly/handleReadClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-function-group"></a>
### Read-Only / Function Group

<a id="readfunctiongroup-read-only-function-group"></a>
#### ReadFunctionGroup (Read-Only / Function Group)
**Description:** [read-only] Read ABAP function group source code and metadata. Answers: "show function group code", "display FUGR source", "view function group X", "get function group includes". Returns source code, package, responsible, description.

**Source:** `src/handlers/function_group/readonly/handleReadFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `include_name` (string, required) - Name of the ABAP Include

---

<a id="getincludeslist-read-only-include"></a>
#### GetIncludesList (Read-Only / Include)
**Description:** [read-only] Recursively discover and list ALL include files within an ABAP program or include.

**Source:** `src/handlers/include/readonly/handleGetIncludesList.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `from_msgno` (string, optional) - Return only messages with a number >= this (inclusive), e.g. "100". Compared as a 
- `include_raw_xml` (boolean, optional) - Include the raw ADT XML. Default FALSE — it roughly doubles the response and is the 
- `include_texts` (boolean, optional) - Include the short texts. Default true. Set false for a numbers-only listing of a 
- `language` (string, optional) - ADT/ISO code (e.g. "ZH", "DE") to read that translation. See Notes.
- `message_class_name` (string, required) - Message class name (e.g., ZMY_MSG).
- `to_msgno` (string, optional) - Return only messages with a number <= this (inclusive).
- `version` (string, optional) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-package"></a>
### Read-Only / Package

<a id="getpackagecontents-read-only-package"></a>
#### GetPackageContents (Read-Only / Package)
**Description:** [read-only] Retrieve objects inside an ABAP package as a flat list. Supports recursive traversal of subpackages. A package that does not exist is an ERROR, never an empty list — so [] means the package is real and empty.

**Notes:** False zero, closed. /repository/nodestructure answers with the SAME empty node set for a package that exists and is empty and for a package name that does not exist at all — measured: a guessed name and a deliberate ZZZ_NO_SUCH_PACKAGE_99 both returned [], while the real package returned 39 objects. A caller therefore could not tell "empty" from "not there", and concluding "empty" is the wrong answer that looks right.  So when the contents come back empty the package's existence is confirmed independently: GET /sap/bc/adt/packages/{name} is an exact oracle (measured 200 for an EMPTY package, 200 for a populated one, 404 for a name that is not there). Missing -> an error naming the package. Present -> [] , which now provably means empty. If the oracle itself cannot answer, that is also an error: a zero this tool cannot stand behind is the defect, not the answer.  The check costs one extra request and only runs on an empty result, so a populated package pays nothing for it.

**Source:** `src/handlers/package/readonly/handleGetPackageContents.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name.
- `version` (string, optional) - active (default) or inactive (newest, incl. pending changes).

---

<a id="readprogram-read-only-program"></a>
#### ReadProgram (Read-Only / Program)
**Description:** [read-only] Read a MAIN ABAP program (report) source code and metadata by name. Works ONLY for main programs (adtcore type PROG/P); NOT for includes — use GetInclude for include source. Include names (PROG/I) and other object types are rejected with error "invalid_object_type". Answers: "show program code", "display report source", "view program X", "get program source". Returns source code, package, responsible, description.

**Source:** `src/handlers/program/readonly/handleReadProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `version` (string, optional (default: active)) - Version to read: "active" (default) or "inactive".

---

<a id="read-only-system"></a>
### Read-Only / System

<a id="searchsource-read-only-system"></a>
#### SearchSource (Read-Only / System)
**Description:** [read-only] Scan ABAP source text inside one or more PACKAGES (programs, function groups, classes). Onprem-only. ⚠️ This is a SCANNER, not a retriever — if you already know the object name, use GetProgram / GetClass / GetInclude / GetFunctionModule / GetStructure / GetTable instead; they are orders of magnitude faster. Narrowing `packages` is the only thing that makes a scan fast. Run ONE SearchSource per destination at a time. See Notes for masks, truncation flags and version behaviour.

**Notes:** packages accepts * masks (Z*, ZFI_*, /NS/Z*) alongside exact names, but mask resolution is best-effort and scoped to the ADT repository-search result window — there is no guarantee every matching package is scanned. If you need certainty, pass concrete package names. `packages` is PACKAGE names (DEVC), not object names; passing * enumerates the whole repository and can take minutes. object_filter is applied AFTER enumeration, so it does not reduce scan cost.  Comments are searched by default; exclude_comments=true drops col-1 * and full-line " comments. The version parameter affects PROG and CLAS main-include reads only — FUGR subinclude reads always go against the active version, because the include endpoint exposes no version selector.  truncated.by_object_cap means at least one object had MORE hits than max_hits_per_object, so that object's hits were capped. It is NOT a limit on the number of objects scanned — that is max_objects, which sets truncated.by_max_objects. To avoid by_object_cap, raise max_hits_per_object.  COVERAGE (I-23). A class is scanned as FIVE source units: source/main plus the CCDEF / CCIMP / CCAU / CCMAC includes, which source/main does NOT contain. Measured on S/4HANA 2023 FPS02: a RAP behavior pool's source/main is a 7-line skeleton while its CCIMP holds the 89 lines of actual handler logic, and a class with 227 lines in main had 394 more in its testclasses include. Scanning main alone therefore answers "no hits" for code it never opened. Hits name the unit they came from, e.g. "ZCL_X (CCIMP)". class_includes=false restores the old main-only behaviour when speed matters more than coverage.  scanned.source_lines is the honest coverage figure — judge a zero-hit result by it, not by scanned.objects. read_failures lists units that could not be read at all; a failed read yields no hits and would otherwise be indistinguishable from "no match".  concurrency is capped at 16 per call. Multiple parallel SearchSource calls against one SAP system saturate the scan backend and can make all of them time out; prefer combining terms into a single call.

**Source:** `src/handlers/system/readonly/handleSearchSource.ts`

**Available in:** `onprem`, `legacy`

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

<a id="read-only-translation"></a>
### Read-Only / Translation

<a id="gettranslation-read-only-translation"></a>
#### GetTranslation (Read-Only / Translation)
**Description:** [read-only] Read the SE63 translation of one object: every text key with its source text (original language), its text in the target language and its max length — e.g. a data element's DDTEXT/REPTEXT/SCRTEXT_S/M/L. PREREQUISITE: an RFC connection and the SE63 helper function group ZMCP_LXE on the SAP system; if it is missing the error says so — install it once with SetupTranslationHelper (ask the user first, it creates Z code).

**Notes:** Reads through LXE_OBJ_TEXT_PAIR_READ, the entry point SE63 itself uses, via the RFC-enabled helper Z_MCP_LXE_READ (installed by SetupTranslationHelper). An empty target means that key has no translation in that language. object_type is the LXE (SE63) object type: DTEL, DOMA, TABT, TRAN, MSAG, MESS, CLAS, … — the same type SE63's short-text editor asks for; object_name is the object's name as SE63 shows it. language accepts the LXE code (zhCN, enUS, deDE), a 2-letter ISO code (ZH, EN, ZF = Chinese traditional) or a SAP 1-character key (1, E); a short code expands to one country variant, reported in language. Reading the ORIGINAL language returns the source text as target (target_is_original_language: true) — that is not a translation.

**Source:** `src/handlers/translation/readonly/handleGetTranslation.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `language` (string, required) - Target language: zhCN / enUS (LXE), ZH / EN (ISO) or 1 / E.
- `object_name` (string, required) - Object name, e.g. ZMY_DATA_ELEMENT.
- `object_type` (string, required) - LXE object type, e.g. DTEL, DOMA, TABT, TRAN, MSAG.
- `source_language` (string, optional (default: the original language).)) - Source language (default: the original language).
- `translation_area` (string, optional) - 

---

<a id="read-only-view"></a>
### Read-Only / View

<a id="readview-read-only-view"></a>
#### ReadView (Read-Only / View)
**Description:** Operation: Read, Create, Update. Subject: View. Will be useful for reading, creating, or updating view. [read-only] Read ABAP CDS view source code and metadata. Answers: "show CDS view source", "display view definition", "view CDS X", "get CDS code". Returns source code, package, responsible, description.

**Source:** `src/handlers/view/readonly/handleReadView.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `version` (string, optional) - Version to read: "active" (default) or "inactive".
- `xslt_name` (string, required) - Transformation name (e.g., ZMY_XSLT).

---

<a id="high-level-group"></a>
## High-Level Group

<a id="high-level-class"></a>
### High-Level / Class

<a id="checkclass-high-level-class"></a>
#### CheckClass (High-Level / Class)
**Description:** Perform syntax check on an ABAP class. Checks the stored version, or a source you supply for an existing class. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/class/high/handleCheckClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `source_code` (string, optional) - Optional: source to check INSTEAD of the stored version. The object must ALREADY EXIST — a checkrun against a name SAP does not know answers "Resource ... does not exist" whatever version is asked for (measured on 7.58), so this validates a CHANGE, not a hypothetical new object. Must include complete CLASS DEFINITION and IMPLEMENTATION sections.
- `version` (string, optional) - Version to check: 'active' (last activated) or 'inactive' (current unsaved). Default: active.

---

<a id="createclass-high-level-class"></a>
#### CreateClass (High-Level / Class)
**Description:** Operation: Create. Subject: Class. Will be useful for creating class. Create a new ABAP class in SAP system. Creates the class object in initial state.

**Source:** `src/handlers/class/high/handleCreateClass.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="deletelocaldefinitions-high-level-class"></a>
#### DeleteLocalDefinitions (High-Level / Class)
**Description:** Delete local definitions from an ABAP class by clearing the definitions include. Manages lock, update, unlock, and optional activation.

**Source:** `src/handlers/class/high/handleDeleteLocalDefinitions.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `activate_on_delete` (boolean, optional (default: false)) - Activate parent class after deleting. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number.

---

<a id="deletelocalmacros-high-level-class"></a>
#### DeleteLocalMacros (High-Level / Class)
**Description:** Delete local macros from an ABAP class by clearing the macros include. Manages lock, update, unlock, and optional activation. Note: Macros are supported in older ABAP versions but not in newer ones.

**Source:** `src/handlers/class/high/handleDeleteLocalMacros.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `activate_on_delete` (boolean, optional (default: false)) - Activate parent class after deleting. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number.

---

<a id="deletelocaltestclass-high-level-class"></a>
#### DeleteLocalTestClass (High-Level / Class)
**Description:** Delete a local test class from an ABAP class by clearing the testclasses include. Manages lock, update, unlock, and optional activation of parent class.

**Source:** `src/handlers/class/high/handleDeleteLocalTestClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `activate_on_delete` (boolean, optional (default: false)) - Activate parent class after deleting test class. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number (required for transportable objects).

---

<a id="deletelocaltypes-high-level-class"></a>
#### DeleteLocalTypes (High-Level / Class)
**Description:** Delete local types from an ABAP class by clearing the implementations include. Manages lock, update, unlock, and optional activation.

**Source:** `src/handlers/class/high/handleDeleteLocalTypes.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `activate_on_delete` (boolean, optional (default: false)) - Activate parent class after deleting. Default: false
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number.

---

<a id="getclass-high-level-class"></a>
#### GetClass (High-Level / Class)
**Description:** Retrieve ABAP class source code. Supports reading active or inactive version.

**Source:** `src/handlers/class/high/handleGetClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="getlocaldefinitions-high-level-class"></a>
#### GetLocalDefinitions (High-Level / Class)
**Description:** Retrieve local definitions source code from a class (definitions include). Supports reading active or inactive version.

**Source:** `src/handlers/class/high/handleGetLocalDefinitions.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="getlocalmacros-high-level-class"></a>
#### GetLocalMacros (High-Level / Class)
**Description:** Retrieve local macros source code from a class (macros include). Supports reading active or inactive version. Note: Macros are supported in older ABAP versions but not in newer ones.

**Source:** `src/handlers/class/high/handleGetLocalMacros.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="getlocaltestclass-high-level-class"></a>
#### GetLocalTestClass (High-Level / Class)
**Description:** Retrieve local test class source code from a class. Supports reading active or inactive version.

**Source:** `src/handlers/class/high/handleGetLocalTestClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="getlocaltypes-high-level-class"></a>
#### GetLocalTypes (High-Level / Class)
**Description:** Retrieve local types source code from a class (implementations include). Supports reading active or inactive version.

**Source:** `src/handlers/class/high/handleGetLocalTypes.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Parent class name (e.g., ZCL_MY_CLASS).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updateclass-high-level-class"></a>
#### UpdateClass (High-Level / Class)
**Description:** Operation: Update, Create. Subject: Class. Will be useful for updating or creating class. Update source code of an existing ABAP class. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/class/high/handleUpdateClass.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `objects` (array, required) - Array of objects to activate. Each object must have 'name' and 'type'.
- `preaudit` (boolean, optional) - Request pre-audit before activation. Default: true

---

<a id="high-level-compact"></a>
### High-Level / Compact

<a id="handlercreate-high-level-compact"></a>
#### HandlerCreate (High-Level / Compact)
**Description:** Create operation. object_type required: PACKAGE(package_name*), DOMAIN(domain_name*), DATA_ELEMENT(data_element_name*), TABLE(table_name*), STRUCTURE(structure_name*), VIEW(view_name*), SERVICE_DEFINITION(service_definition_name*), SERVICE_BINDING(service_binding_name*), CLASS(class_name*), PROGRAM(program_name*) [onprem/legacy only], INTERFACE(interface_name*), FUNCTION_GROUP(function_group_name*), FUNCTION_MODULE(function_module_name*, function_group_name*), BEHAVIOR_DEFINITION(behavior_definition_name*), BEHAVIOR_IMPLEMENTATION(behavior_implementation_name*), METADATA_EXTENSION(metadata_extension_name*), UNIT_TEST(run_id*), CDS_UNIT_TEST(run_id*).

**Source:** `src/handlers/compact/high/handleHandlerCreate.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, optional) - ABAP class name.
- `domain_name` (string, optional) - ABAP domain name.
- `function_group_name` (string, optional) - ABAP function group name.
- `function_module_name` (string, optional) - ABAP function module name.
- `object_type` (any, required) - 
- `program_name` (string, optional) - ABAP program name.
- `transport_request` (string, optional) - Transport request id (if required by system).

---

<a id="handlerget-high-level-compact"></a>
#### HandlerGet (High-Level / Compact)
**Description:** Read operation. object_type required: PACKAGE(package_name*), DOMAIN(domain_name*), DATA_ELEMENT(data_element_name*), TABLE(table_name*), STRUCTURE(structure_name*), VIEW(view_name*), SERVICE_DEFINITION(service_definition_name*), SERVICE_BINDING(service_binding_name*), CLASS(class_name*), LOCAL_TEST_CLASS(class_name*), LOCAL_TYPES(class_name*), LOCAL_DEFINITIONS(class_name*), LOCAL_MACROS(class_name*), PROGRAM(program_name*) [onprem/legacy only], INTERFACE(interface_name*), FUNCTION_GROUP(function_group_name*), FUNCTION_MODULE(function_module_name*, function_group_name*), BEHAVIOR_DEFINITION(behavior_definition_name*), BEHAVIOR_IMPLEMENTATION(behavior_implementation_name*), METADATA_EXTENSION(metadata_extension_name*), UNIT_TEST(run_id*), CDS_UNIT_TEST(run_id*).

**Source:** `src/handlers/compact/high/handleHandlerGet.ts`

**Available in:** `onprem`, `legacy`

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

<a id="handlerupdate-high-level-compact"></a>
#### HandlerUpdate (High-Level / Compact)
**Description:** Update operation. object_type required: PACKAGE(package_name*), DOMAIN(domain_name*), DATA_ELEMENT(data_element_name*), TABLE(table_name*), STRUCTURE(structure_name*), VIEW(view_name*), SERVICE_DEFINITION(service_definition_name*), SERVICE_BINDING(service_binding_name*), CLASS(class_name*), LOCAL_TEST_CLASS(class_name*), LOCAL_TYPES(class_name*), LOCAL_DEFINITIONS(class_name*), LOCAL_MACROS(class_name*), PROGRAM(program_name*) [onprem/legacy only], INTERFACE(interface_name*), FUNCTION_GROUP(function_group_name*), FUNCTION_MODULE(function_module_name*, function_group_name*), BEHAVIOR_DEFINITION(behavior_definition_name*), BEHAVIOR_IMPLEMENTATION(behavior_implementation_name*), METADATA_EXTENSION(metadata_extension_name*), UNIT_TEST(run_id*), CDS_UNIT_TEST(run_id*).

**Source:** `src/handlers/compact/high/handleHandlerUpdate.ts`

**Available in:** `onprem`, `legacy`

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

<a id="high-level-function"></a>
### High-Level / Function

<a id="checkfunctiongroup-high-level-function"></a>
#### CheckFunctionGroup (High-Level / Function)
**Description:** Perform syntax check on an ABAP function group. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/function/high/handleCheckFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., ZFGRP_MY_GROUP).

---

<a id="checkfunctionmodule-high-level-function"></a>
#### CheckFunctionModule (High-Level / Function)
**Description:** Perform syntax check on an ABAP function module. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/function/high/handleCheckFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name containing the function module.
- `function_module_name` (string, required) - Function module name (e.g., Z_MY_FUNCTION).
- `version` (string, optional) - Version to check: 'active' or 'inactive'. Default: active.

---

<a id="createfunctiongroup-high-level-function"></a>
#### CreateFunctionGroup (High-Level / Function)
**Description:** Create a new ABAP function group in SAP system. Function groups serve as containers for function modules. Uses stateful session for proper lock management.

**Source:** `src/handlers/function/high/handleCreateFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, required) - New description for the function group.
- `function_group_name` (string, required) - Function group name (e.g., ZTEST_FG_001). Must exist in the system.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.

---

<a id="updatefunctionmodule-high-level-function"></a>
#### UpdateFunctionModule (High-Level / Function)
**Description:** Operation: Update, Create. Subject: FunctionModule. Will be useful for updating or creating function module. Update source code of an existing ABAP function module. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/function/high/handleUpdateFunctionModule.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_FUNCTIONGROUP).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getfunctiongroup-high-level-function-group"></a>
#### GetFunctionGroup (High-Level / Function Group)
**Description:** Retrieve ABAP function group definition. Supports reading active or inactive version.

**Source:** `src/handlers/function_group/high/handleGetFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name containing the function module (e.g., Z_MY_FUNCTIONGROUP).
- `function_module_name` (string, required) - FunctionModule name (e.g., Z_MY_FUNCTIONMODULE).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getfunctionmodule-high-level-function-module"></a>
#### GetFunctionModule (High-Level / Function Module)
**Description:** Retrieve an ABAP function module definition. Supports reading the active or inactive version. NOTE: the containing function GROUP is REQUIRED — ADT addresses a function module as <group>/fmodules/<module>, so there is no lookup by module name alone, so this tool resolves the group itself when you omit it (TFDIR-PNAME with the SAPL prefix removed) and reports which group it used. Passing it explicitly is still faster and avoids a lookup. Historic note — the manual route was: run GetSqlQuery on table TFDIR filtered by FUNCNAME, take PNAME and drop its leading SAPL prefix.

**Source:** `src/handlers/function_module/high/handleGetFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, optional) - Function group containing the module (e.g., Z_MY_FUNCTIONGROUP). OPTIONAL: when 
- `function_module_name` (string, required) - FunctionModule name (e.g., Z_MY_FUNCTIONMODULE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="high-level-interface"></a>
### High-Level / Interface

<a id="checkinterface-high-level-interface"></a>
#### CheckInterface (High-Level / Interface)
**Description:** Perform syntax check on an ABAP interface. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/interface/high/handleCheckInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., ZIF_MY_INTERFACE).

---

<a id="createinterface-high-level-interface"></a>
#### CreateInterface (High-Level / Interface)
**Description:** Operation: Create. Subject: Interface. Will be useful for creating interface. Create a new ABAP interface in SAP system. Creates the interface object in initial state.

**Source:** `src/handlers/interface/high/handleCreateInterface.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_INTERFACE).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getinterface-high-level-interface"></a>
#### GetInterface (High-Level / Interface)
**Description:** Retrieve ABAP interface definition. Supports reading active or inactive version.

**Source:** `src/handlers/interface/high/handleGetInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_INTERFACE).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updateinterface-high-level-interface"></a>
#### UpdateInterface (High-Level / Interface)
**Description:** Operation: Update, Create. Subject: Interface. Will be useful for updating or creating interface. Update source code of an existing ABAP interface. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/interface/high/handleUpdateInterface.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `lock_object_name` (string, required) - Lock object name.
- `transport_request` (string, optional) - Transport request. Required for transportable objects; optional for $TMP.

---

<a id="updatelockobject-high-level-lockobject"></a>
#### UpdateLockObject (High-Level / Lockobject)
**Description:** Operation: Update. Subject: LockObject (ENQU). Update an existing lock object (primary table, lock mode, RFC flag). Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/lockobject/high/handleUpdateLockObject.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `message_class_name` (string, required) - Message class name.
- `transport_request` (string, optional) - Transport request. Required for transportable objects; optional for $TMP.

---

<a id="updatemessage-high-level-messageclass"></a>
#### UpdateMessage (High-Level / Messageclass)
**Description:** Operation: Update. Subject: One message in a message class (SE91). Change a single message’s text or self-explanatory flag, leaving every other message untouched. Fails if the message number does not exist. Pass language to write a TRANSLATION instead: the master-language row is verified unchanged against T100 and the call fails if it moved.

**Notes:** Parallelism. Every write to a message class takes the SAME lock on the WHOLE class, so concurrent UpdateMessage calls against one class queue behind each other rather than running side by side. Measured by a reporting project rewriting 109 texts: 8 calls in parallel completed fine, 15 did not — 2 of the 15 exceeded the client timeout, and those two had NOT been applied. Keep a batch on one class at or below ~8 concurrent calls, or send them sequentially; the wall-clock difference is small because they serialise on the lock either way.  A timeout here is not proof the write failed: the request was sent and SAP may still be holding the lock. Read the message back with GetMessageClass before re-sending. Raise SAP_TIMEOUT_DEFAULT (milliseconds, default 45000) if a class is large enough that single writes are slow.  Translations (the language parameter). Measured end to end on S/4HANA 2023 FPS02, acceptance test = T100 rows per language before and after, never an HTTP status.    * The row a text lands in is decided by the SESSION language, and the session's language is fixed     by the request that OPENS it — the LOCK. sap-language on the PUT alone only changes how the     response is rendered. Proven: on a connection pinned to EN, a lock carrying sap-language=ZH plus     the PUT wrote T100 SPRSL='1' and left SPRSL='E' byte-identical; the; same; PUT; with the lock in EN wrote; ('E'); instead.   * THE TRAP, which; is; why; the; payload; is; one; message; and; not; the; class: a read in the target     language falls back to the MASTER text for every message that has no row there, so writing the     whole list back manufactures a target-language row holding the master text for every     untranslated message. Measured: updating 001 in ZH with the full list created a ZH row for 002     containing its English text. On a 109-message class that is 108 fabricated translations, which     is worse than none because the translation tools then treat them as done. UpdateMessageClass is     an UPSERT, so a one-message payload leaves the others alone — verified: message 003 gained no ZH     row.   * The tool verifies itself against T100 and REFUSES to report success if the master-language row     changed or disappeared. The class read cannot do this: ADT serves the master text when the     language has no row, so a "successful" read is exactly what a failed translation looks like.   * self_explanatory is refused alongside language — the flag belongs to the message, not to one     language. Adding a message in a non-master language is refused for the same reason: create it in     the master language first.  Without language the text is written in the session language, which this server pins to SAP_LANGUAGE (default EN).

**Source:** `src/handlers/messageclass/high/handleUpdateMessage.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `message_class_name` (string, required) - Message class name (must exist).
- `messages` (array, required) - Messages to create or update. Messages of this class that are NOT listed here are 
- `transport_request` (string, optional) - Transport request (if transportable).

---

<a id="high-level-package"></a>
### High-Level / Package

<a id="checkpackage-high-level-package"></a>
#### CheckPackage (High-Level / Package)
**Description:** Perform syntax check on an ABAP package. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/package/high/handleCheckPackage.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., ZMY_PACKAGE).
- `super_package` (string, required) - Super package name (parent package).

---

<a id="deletepackage-high-level-package"></a>
#### DeletePackage (High-Level / Package)
**Description:** Operation: Delete. Subject: Package. Delete an ABAP package (DEVC) from the SAP system. The package must be EMPTY — SAP refuses to delete a package that still contains objects, and the refusal reason is relayed verbatim. Transport request required for transportable packages, optional for local ones ($*). NOTE: ADT cannot delete a package that has no TADIR/TDEVC record (a half-created "orphan" package); such a package needs SAP-side cleanup via SE21.

**Source:** `src/handlers/package/high/handleDeletePackage.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., ZMCP_TEST).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900065). Required for transportable packages. Omit for local packages ($*).

---

<a id="getpackage-high-level-package"></a>
#### GetPackage (High-Level / Package)
**Description:** Retrieve ABAP package metadata (description, super-package, etc.). Supports reading active or inactive version.

**Source:** `src/handlers/package/high/handleGetPackage.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., ZMCP_MY_PROGRAM).

---

<a id="createprogram-high-level-program"></a>
#### CreateProgram (High-Level / Program)
**Description:** Operation: Create. Subject: Program. Will be useful for creating program. Create a new ABAP program (report) in SAP system. Creates the program object in initial state.

**Source:** `src/handlers/program/high/handleCreateProgram.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getprogram-high-level-program"></a>
#### GetProgram (High-Level / Program)
**Description:** Retrieve ABAP program definition. Supports reading active or inactive version.

**Source:** `src/handlers/program/high/handleGetProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.

---

<a id="updateprogram-high-level-program"></a>
#### UpdateProgram (High-Level / Program)
**Description:** Operation: Update, Create. Subject: Program. Will be useful for updating or creating program. Update source code of an existing ABAP program. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/program/high/handleUpdateProgram.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `activate` (boolean, optional) - 
- `mode` (string, optional) - 
- `program_name` (string, required) - Program.
- `remove_symbols` (array, optional) - Keys.
- `selections` (array, optional) - [{"name":"P_FILE","text":"…"}]
- `symbols` (array, optional) - [{"key":"001","text":"…"}]
- `transport_request` (string, optional) - 

---

<a id="high-level-transaction"></a>
### High-Level / Transaction

<a id="createtransaction-high-level-transaction"></a>
#### CreateTransaction (High-Level / Transaction)
**Description:** Create a report transaction code (SE93 "program and selection screen", optional start variant), verified by reading TSTC/TSTCT/TSTCP/TADIR back. NEEDS an RFC connection and the helper ZMCP_TRAN on the system — if missing, the error says to run SetupTransactionHelper (ask the user first).

**Notes:** Report transactions only (type R): the program must be EXECUTABLE (TRDIR-SUBC 1). Created through RPY_TRANSACTION_INSERT, the module SE93 itself uses, via the RFC-enabled helper Z_MCP_TRAN_CREATE.  Refused BEFORE anything is written: a code outside the customer namespace (Z*, Y*, /ns/) or that already exists; a program that does not exist or is not executable; a selection_screen other than 1000 that the program does not have (a program without screen 1000 — no PARAMETERS yet — is allowed with a warning); a variant that does not exist; a missing package; a transportable package without transport_request, or a request that is missing, released, or not a workbench request/task.  variant: a system variant (CUS&... / SAP&..., checked in client 000) works in every client; any other variant is client-specific and is checked in the current client, with a warning.  The short text is stored in the logon language of the RFC session (reported as language) — that is the transaction's original language.  Verified after creation: TSTC (program, screen, CINFO 80 = report transaction), TSTCT (text), TSTCP (the variant, or none), TADIR (package), and E071 (the request or one of its tasks) when a transport_request is given. dry_run runs every check and creates nothing.

**Source:** `src/handlers/transaction/high/handleCreateTransaction.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `transaction_code` (string, required) - 
- `transport_request` (string, optional) - 

---

<a id="setuptransactionhelper-high-level-transaction"></a>
#### SetupTransactionHelper (High-Level / Transaction)
**Description:** One-time install of the SE93 helper that CreateTransaction / DeleteTransaction need: function group ZMCP_TRAN with two RFC-enabled modules (Z_MCP_TRAN_CREATE / _DELETE), source shipped with this server. WRITES Z CODE INTO THE SAP SYSTEM — ask the user before calling it. Default package $TMP (no transport). Safe to re-run.

**Notes:** Why a Z helper: ADT has no transaction resource, and SE93's own RPY_TRANSACTION_INSERT / RPY_TRANSACTION_DELETE are not RFC-enabled. Same installer as SetupTranslationHelper: an up-to-date helper is left alone unless force:true, a newer one is never downgraded, a same-named module in another function group is refused; verified by TFDIR (RFC-enabled), the ACTIVE source read back through ADT, and an RFC call on a fresh ABAP session. package_name other than $TMP needs transport_request.

**Source:** `src/handlers/transaction/high/handleSetupTransactionHelper.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `dry_run` (boolean, optional) - Check only, write nothing.
- `language` (string, required) - Target language: zhCN (LXE), ZH (ISO) or 1 (SAP key).
- `object_name` (string, required) - Object name.
- `object_type` (string, required) - LXE type: DTEL, DOMA, TABT, TRAN, …
- `texts` (array, required) - e.g. [{"key":"SCRTEXT_M","text":"销售订单"}]
- `translation_area` (string, optional) - 

---

<a id="high-level-unit-test"></a>
### High-Level / Unit Test

<a id="createcdsunittest-high-level-unit-test"></a>
#### CreateCdsUnitTest (High-Level / Unit Test)
**Description:** Create a CDS unit test class with CDS validation. Creates the test class in initial state.

**Source:** `src/handlers/unit_test/high/handleCreateCdsUnitTest.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Global test class name (e.g., ZCL_CDS_TEST).
- `transport_request` (string, optional) - Transport request number (required for transportable packages).

---

<a id="deleteunittest-high-level-unit-test"></a>
#### DeleteUnitTest (High-Level / Unit Test)
**Description:** Delete an ABAP Unit test run. Note: ADT does not support deleting unit test runs and will return an error.

**Source:** `src/handlers/unit_test/high/handleDeleteUnitTest.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by CreateUnitTest/RunUnitTest.

---

<a id="getcdsunittest-high-level-unit-test"></a>
#### GetCdsUnitTest (High-Level / Unit Test)
**Description:** Retrieve CDS unit test run status and result for a previously started run_id.

**Source:** `src/handlers/unit_test/high/handleGetCdsUnitTest.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by unit test run.

---

<a id="getcdsunittestresult-high-level-unit-test"></a>
#### GetCdsUnitTestResult (High-Level / Unit Test)
**Description:** Retrieve CDS unit test run result for a run_id.

**Source:** `src/handlers/unit_test/high/handleGetCdsUnitTestResult.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `format` (string, optional) - Result format: abapunit or junit.
- `run_id` (string, required) - Run identifier returned by unit test run.
- `with_navigation_uris` (boolean, optional (default: false)) - Include navigation URIs in result if supported.

---

<a id="getcdsunitteststatus-high-level-unit-test"></a>
#### GetCdsUnitTestStatus (High-Level / Unit Test)
**Description:** Retrieve CDS unit test run status for a run_id.

**Source:** `src/handlers/unit_test/high/handleGetCdsUnitTestStatus.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by unit test run.
- `with_long_polling` (boolean, optional (default: true)) - Enable long polling while waiting for status.

---

<a id="getunittest-high-level-unit-test"></a>
#### GetUnitTest (High-Level / Unit Test)
**Description:** Retrieve ABAP Unit test run status and result for a previously started run_id. NOTE: on modern systems RunUnitTest/CreateUnitTest already return the full result synchronously (in the "result" field) — this run_id lookup targets the legacy async run and is generally not needed.

**Source:** `src/handlers/unit_test/high/handleGetUnitTest.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by RunUnitTest.

---

<a id="getunittestresult-high-level-unit-test"></a>
#### GetUnitTestResult (High-Level / Unit Test)
**Description:** Retrieve ABAP Unit test run result for a run_id. NOTE: RunUnitTest/CreateUnitTest return the result synchronously on modern systems; this targets the legacy async run and is generally not needed.

**Source:** `src/handlers/unit_test/high/handleGetUnitTestResult.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `format` (string, optional) - Result format: abapunit or junit.
- `run_id` (string, required) - Run identifier returned by unit test run.
- `with_navigation_uris` (boolean, optional (default: false)) - Include navigation URIs in result if supported.

---

<a id="getunitteststatus-high-level-unit-test"></a>
#### GetUnitTestStatus (High-Level / Unit Test)
**Description:** Retrieve ABAP Unit test run status for a run_id. NOTE: RunUnitTest/CreateUnitTest return results synchronously on modern systems; this targets the legacy async run and is generally not needed.

**Source:** `src/handlers/unit_test/high/handleGetUnitTestStatus.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by unit test run.
- `with_long_polling` (boolean, optional (default: true)) - Enable long polling while waiting for status.

---

<a id="rununittest-high-level-unit-test"></a>
#### RunUnitTest (High-Level / Unit Test)
**Description:** Start an ABAP Unit test run for provided class test definitions. Returns run_id for status/result queries.

**Source:** `src/handlers/unit_test/high/handleRunUnitTest.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Global test class name (e.g., ZCL_CDS_TEST).
- `test_class_source` (string, required) - Updated local test class ABAP source code.
- `transport_request` (string, optional) - Transport request number (required for transportable packages).

---

<a id="updateunittest-high-level-unit-test"></a>
#### UpdateUnitTest (High-Level / Unit Test)
**Description:** Update an ABAP Unit test run. Note: ADT does not support updating unit test runs and will return an error.

**Source:** `src/handlers/unit_test/high/handleUpdateUnitTest.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by CreateUnitTest/RunUnitTest.

---

<a id="high-level-view"></a>
### High-Level / View

<a id="checkview-high-level-view"></a>
#### CheckView (High-Level / View)
**Description:** Perform syntax check on an ABAP CDS view. Checks the stored version, or DDL you supply for an existing view. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/view/high/handleCheckView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `ddl_source` (string, optional) - Optional: DDL source code to validate instead of the saved version.
- `version` (string, optional) - Version to check: 'active' or 'inactive'.
- `view_name` (string, required) - CDS view name (e.g., ZI_MY_VIEW).

---

<a id="createview-high-level-view"></a>
#### CreateView (High-Level / View)
**Description:** Operation: Create. Subject: CDS view (DDLS). Create a new CDS DDL source. IMPORTANT: this always POSTs to /sap/bc/adt/ddic/ddl/sources and therefore produces a CDS DDL SOURCE — a CLASSIC DDIC database view (VIEW/DV) CANNOT be created with this tool; use SE11 for that. NOTE ON SHAPE: this creates an EMPTY source only — write the actual "define view entity ..." with UpdateView (which defaults to activate:FALSE, so pass activate:true or activate later with ActivateObjects).

**Source:** `src/handlers/view/high/handleCreateView.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).
- `view_name` (string, required) - View name (e.g., Z_MY_VIEW).

---

<a id="getview-high-level-view"></a>
#### GetView (High-Level / View)
**Description:** Retrieve an ABAP view definition (CDS DDL source or classic view). Supports reading the active or inactive version. IMPORTANT: pass the DDL SOURCE object name, which is often NOT the CDS entity name — a source ZI_ORDER may define entity ZI_ORDER_E, and passing the entity name returns 404. Use SearchObject with type DDLS to find the source name.

**Source:** `src/handlers/view/high/handleGetView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `version` (string, optional (default: active)) - Version to read: "active" (default) for deployed version, "inactive" for modified but not activated version.
- `view_name` (string, required) - DDL SOURCE object name (e.g., Z_MY_VIEW) — not the CDS entity name defined inside it. The two frequently differ; using the entity name gives 404.

---

<a id="updateview-high-level-view"></a>
#### UpdateView (High-Level / View)
**Description:** Operation: Update, Create. Subject: View. Will be useful for updating or creating view. Update DDL source code of an existing CDS View or Classic View. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/view/high/handleUpdateView.ts`

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

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

**Available in:** `onprem`, `legacy`

**Parameters:**
- `transport_request` (string, optional) - Transport request. Required for transportable objects; optional for $TMP.
- `xslt_name` (string, required) - Transformation name.

---

<a id="updatexslt-high-level-xslt"></a>
#### UpdateXslt (High-Level / Xslt)
**Description:** Operation: Update. Subject: Transformation (XSLT). Update the source of an existing ABAP transformation. Locks, updates, unlocks, and optionally activates.

**Source:** `src/handlers/xslt/high/handleUpdateXslt.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `activate` (boolean, optional) - Activate after the update. DEFAULT: TRUE — omitting it activates the object. Pass false to leave it inactive (e.g. when several mutually dependent objects must be activated together afterwards with ActivateObjects). The activated field in the response is SAP's own verdict, not a copy of this parameter.
- `source_code` (string, required) - Complete XSLT / Simple Transformation source.
- `transport_request` (string, optional) - Transport request (if transportable).
- `xslt_name` (string, required) - Transformation name (must exist).

---

<a id="low-level-group"></a>
## Low-Level Group

<a id="low-level-class"></a>
### Low-Level / Class

<a id="activateclasslow-low-level-class"></a>
#### ActivateClassLow (Low-Level / Class)
**Description:** Operation: Activate, Create, Update. Subject: Class. Will be useful for activating, creating, or updating class. [low-level] Activate an ABAP class. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/class/low/handleActivateClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="activateclasstestclasseslow-low-level-class"></a>
#### ActivateClassTestClassesLow (Low-Level / Class)
**Description:** [low-level] Activate ABAP Unit test classes include for an existing class. Should be executed after updating and unlocking test classes.

**Source:** `src/handlers/class/low/handleActivateClassTestClasses.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `test_class_name` (string, optional) - Optional ABAP Unit test class name (e.g., LTCL_MY_CLASS). Defaults to auto-detected value.

---

<a id="checkclasslow-low-level-class"></a>
#### CheckClassLow (Low-Level / Class)
**Description:** [low-level] Perform syntax check on an ABAP class. Checks the stored version, or a source you supply for an existing class. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/class/low/handleCheckClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS)
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `source_code` (string, optional) - Optional: source to check INSTEAD of the stored version. The object must ALREADY EXIST — a checkrun against a name SAP does not know answers "Resource ... does not exist" whatever version is asked for (measured on 7.58), so this validates a CHANGE, not a hypothetical new object. Must include complete CLASS DEFINITION and IMPLEMENTATION sections.
- `version` (string, optional) - Version to check: 'active' (last activated) or 'inactive' (current unsaved). Default: active

---

<a id="createclasslow-low-level-class"></a>
#### CreateClassLow (Low-Level / Class)
**Description:** [low-level] Create a new ABAP class. - use CreateClass (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/class/low/handleCreateClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `abstract` (boolean, optional (default: false).)) - Mark class as abstract (optional, default: false).
- `class_name` (string, required) - Class name (e.g., ZCL_TEST_CLASS_001). Must follow SAP naming conventions.
- `create_protected` (boolean, optional (default: false).)) - Create protected section (optional, default: false).
- `description` (string, required) - Class description.
- `final` (boolean, optional (default: false).)) - Mark class as final (optional, default: false).
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `superclass` (string, optional) - Superclass name (optional).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deleteclasslow-low-level-class"></a>
#### DeleteClassLow (Low-Level / Class)
**Description:** [low-level] Delete an ABAP class from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/class/low/handleDeleteClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getclassunittestresultlow-low-level-class"></a>
#### GetClassUnitTestResultLow (Low-Level / Class)
**Description:** [low-level] Retrieve ABAP Unit run result (ABAPUnit or JUnit XML) for a completed run_id. NOTE: RunClassUnitTestsLow returns results synchronously; this targets the legacy async run and is generally not needed.

**Source:** `src/handlers/class/low/handleGetClassUnitTestResult.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `format` (string, optional) - Preferred response format. Defaults to 'abapunit'.
- `run_id` (string, required) - Run identifier returned by RunClassUnitTestsLow.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `with_navigation_uris` (boolean, optional) - Optional flag to request navigation URIs in SAP response (default true).

---

<a id="getclassunitteststatuslow-low-level-class"></a>
#### GetClassUnitTestStatusLow (Low-Level / Class)
**Description:** [low-level] Retrieve ABAP Unit run status XML for a previously started run_id. NOTE: RunClassUnitTestsLow returns results synchronously; this targets the legacy async run and is generally not needed.

**Source:** `src/handlers/class/low/handleGetClassUnitTestStatus.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `run_id` (string, required) - Run identifier returned by RunClassUnitTestsLow.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `with_long_polling` (boolean, optional) - Optional flag to enable SAP long-polling (default true).

---

<a id="lockclasslow-low-level-class"></a>
#### LockClassLow (Low-Level / Class)
**Description:** [low-level] Lock an ABAP class for modification. Uses session from HandlerContext. Returns lock handle that must be used in subsequent update/unlock operations.

**Source:** `src/handlers/class/low/handleLockClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).

---

<a id="lockclasstestclasseslow-low-level-class"></a>
#### LockClassTestClassesLow (Low-Level / Class)
**Description:** [low-level] Lock ABAP Unit test classes include (CLAS/OC testclasses) for the specified class. Returns a test_classes_lock_handle for subsequent update/unlock operations using the same session.

**Source:** `src/handlers/class/low/handleLockClassTestClasses.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="runclassunittestslow-low-level-class"></a>
#### RunClassUnitTestsLow (Low-Level / Class)
**Description:** [low-level] Start an ABAP Unit test run for provided class test definitions. Returns run_id extracted from SAP response headers.

**Source:** `src/handlers/class/low/handleRunClassUnitTests.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `context` (string, optional) - Optional context string shown in SAP tools.
- `duration` (object, optional) - 
- `risk_level` (object, optional) - 
- `scope` (object, optional) - 
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `tests` (array, required) - List of container/test class pairs to execute.
- `title` (string, optional) - Optional title for the ABAP Unit run.

---

<a id="unlockclasslow-low-level-class"></a>
#### UnlockClassLow (Low-Level / Class)
**Description:** [low-level] Unlock an ABAP class after modification. Uses session from HandlerContext. Must use the same lock_handle from LockClass operation.

**Source:** `src/handlers/class/low/handleUnlockClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `lock_handle` (string, required) - Lock handle from LockClass operation.

---

<a id="unlockclasstestclasseslow-low-level-class"></a>
#### UnlockClassTestClassesLow (Low-Level / Class)
**Description:** [low-level] Unlock ABAP Unit test classes include for a class using the test_classes_lock_handle obtained from LockClassTestClassesLow.

**Source:** `src/handlers/class/low/handleUnlockClassTestClasses.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `lock_handle` (string, required) - Lock handle returned by LockClassTestClassesLow.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="updateclasslow-low-level-class"></a>
#### UpdateClassLow (Low-Level / Class)
**Description:** [low-level] Update source code of an existing ABAP class. Uses session from HandlerContext. Requires lock handle from LockClass operation. - use UpdateClass (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/class/low/handleUpdateClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_TEST_CLASS_001). Class must already exist.
- `lock_handle` (string, required) - Lock handle from LockClass operation. Required for update operation.
- `source_code` (string, required) - Complete ABAP class source code including CLASS DEFINITION and IMPLEMENTATION sections.

---

<a id="updateclasstestclasseslow-low-level-class"></a>
#### UpdateClassTestClassesLow (Low-Level / Class)
**Description:** [low-level] Upload ABAP Unit test include source code for an existing class. Requires test_classes_lock_handle from LockClassTestClassesLow.

**Source:** `src/handlers/class/low/handleUpdateClassTestClasses.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `lock_handle` (string, required) - Test classes lock handle from LockClassTestClassesLow.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `test_class_source` (string, required) - Complete ABAP Unit test class source code.
- `transport_request` (string, optional) - Transport request number. Required when the parent class is a transportable (non-$TMP) object; forwarded as corrNr so the test-include write is recorded in the request. Omit for $TMP/local classes.

---

<a id="validateclasslow-low-level-class"></a>
#### ValidateClassLow (Low-Level / Class)
**Description:** [low-level] Validate an ABAP class name before creation. Checks if the name is valid, available, and validates package, description, and superclass if provided. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/class/low/handleValidateClass.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `class_name` (string, required) - Class name to validate (e.g., ZCL_MY_CLASS)
- `description` (string, required) - Description for validation (required).
- `package_name` (string, required) - Package name for validation (required).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `superclass` (string, optional) - Optional superclass name for validation (e.g., CL_OBJECT)

---

<a id="low-level-common"></a>
### Low-Level / Common

<a id="activateobjectlow-low-level-common"></a>
#### ActivateObjectLow (Low-Level / Common)
**Description:** [low-level] Activate one or multiple ABAP repository objects. Works with any object type; URI is auto-generated from name and type.

**Source:** `src/handlers/common/low/handleActivateObject.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `objects` (array, required) - Array of objects to activate. Each object must have 'name' and 'type'. URI is optional.
- `preaudit` (boolean, optional) - Request pre-audit before activation. Default: true

---

<a id="deleteobjectlow-low-level-common"></a>
#### DeleteObjectLow (Low-Level / Common)
**Description:** [low-level] Delete an ABAP object via ADT deletion API. Transport request optional for $TMP objects. Note: object_type "program" is onprem/legacy only — calling it on ABAP Cloud will fail.

**Source:** `src/handlers/common/low/handleDeleteObject.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, optional) - Required only for function_module type
- `object_name` (string, required) - Object name (e.g., ZCL_MY_CLASS)
- `object_type` (string, required) - Object type. Supported: class, program (onprem/legacy only), interface, function_group, function_module, table, structure, table_type, view, domain, data_element, behavior_definition, metadata_extension. Also accepts ADT codes (clas/oc, prog/p, intf/oi, fugr/f, fugr/ff, tabl/dt, tabl/ds, ttyp/da, ddls/df, doma/dm, dtel/de, bdef/bd, ddlx/ex). For a high-level delete that VERIFIES the object is really gone, prefer the per-type Delete<Object> tools - ADT answers HTTP 200 even when it refuses a deletion.
- `transport_request` (string, optional) - Transport request number

---

<a id="low-level-function"></a>
### Low-Level / Function

<a id="activatefunctiongrouplow-low-level-function"></a>
#### ActivateFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Activate an ABAP function group. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleActivateFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., Z_FG_TEST).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="activatefunctionmodulelow-low-level-function"></a>
#### ActivateFunctionModuleLow (Low-Level / Function)
**Description:** Operation: Activate, Create, Update. Subject: FunctionModule. Will be useful for activating, creating, or updating function module. [low-level] Activate an ABAP function module. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleActivateFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., Z_FG_TEST).
- `function_module_name` (string, required) - Function module name (e.g., Z_FM_TEST).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkfunctiongrouplow-low-level-function"></a>
#### CheckFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Perform syntax check on an ABAP function group. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleCheckFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkfunctionmodulelow-low-level-function"></a>
#### CheckFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Perform syntax check on an ABAP function module. Returns syntax errors, warnings, and messages. Requires function group name. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleCheckFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., Z_FUGR_TEST_0001)
- `function_module_name` (string, required) - Function module name (e.g., Z_TEST_FM)
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `version` (string, optional) - Version to check: 'active' (last activated) or 'inactive' (current unsaved). Default: active

---

<a id="createfunctiongrouplow-low-level-function"></a>
#### CreateFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Create a new ABAP function group. - use CreateFunctionGroup (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/function/low/handleCreateFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, required) - Function group description.
- `function_group_name` (string, required) - Function group name (e.g., ZFG_MY_GROUP). Must follow SAP naming conventions.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="createfunctionmodulelow-low-level-function"></a>
#### CreateFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Create a new ABAP function module. - use CreateFunctionModule (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/function/low/handleCreateFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, required) - Function module description.
- `function_group_name` (string, required) - Function group name (e.g., ZFG_MY_GROUP).
- `function_module_name` (string, required) - Function module name (e.g., Z_MY_FUNCTION).
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deletefunctiongrouplow-low-level-function"></a>
#### DeleteFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Delete an ABAP function group from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/function/low/handleDeleteFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="deletefunctionmodulelow-low-level-function"></a>
#### DeleteFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Delete an ABAP function module from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/function/low/handleDeleteFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., ZFG_MY_GROUP).
- `function_module_name` (string, required) - Function module name (e.g., Z_MY_FUNCTION).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockfunctiongrouplow-low-level-function"></a>
#### LockFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Lock an ABAP function group for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/function/low/handleLockFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="lockfunctionmodulelow-low-level-function"></a>
#### LockFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Lock an ABAP function module for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/function/low/handleLockFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., ZFG_MY_GROUP).
- `function_module_name` (string, required) - Function module name (e.g., Z_MY_FUNCTION).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockfunctiongrouplow-low-level-function"></a>
#### UnlockFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Unlock an ABAP function group after modification. Requires the lock_handle from LockFunctionGroup operation.

**Source:** `src/handlers/function/low/handleUnlockFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_PROGRAM).
- `lock_handle` (string, required) - Lock handle from LockFunctionGroup operation.
- `session_id` (string, optional) - Session ID from LockFunctionGroup operation. Must be the same as used in LockFunctionGroup.
- `session_state` (object, optional) - Session state from LockFunctionGroup (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockfunctionmodulelow-low-level-function"></a>
#### UnlockFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Unlock an ABAP function module after modification. Requires the lock_handle from LockFunctionModule operation.

**Source:** `src/handlers/function/low/handleUnlockFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., ZFG_MY_GROUP).
- `function_module_name` (string, required) - Function module name (e.g., Z_MY_FUNCTION).
- `lock_handle` (string, required) - Lock handle from LockFunctionModule operation.
- `session_id` (string, optional) - Session ID from LockFunctionModule operation. Must be the same as used in LockFunctionModule.
- `session_state` (object, optional) - Session state from LockFunctionModule (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="updatefunctionmodulelow-low-level-function"></a>
#### UpdateFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Update source code of an existing ABAP function module. Requires lock handle from LockObject and function group name. - use UpdateFunctionModule (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/function/low/handleUpdateFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `function_group_name` (string, required) - Function group name containing the function module (e.g., Z_TEST_FG).
- `function_module_name` (string, required) - Function module name (e.g., Z_TEST_FM). Function module must already exist.
- `lock_handle` (string, required) - Lock handle from LockFunctionModule. Required for update operation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `source_code` (string, required) - Complete ABAP function module source code.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects locked in a request.

---

<a id="validatefunctiongrouplow-low-level-function"></a>
#### ValidateFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Validate an ABAP function group name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleValidateFunctionGroup.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, optional) - Optional description for validation
- `function_group_name` (string, required) - FunctionGroup name to validate (e.g., Z_MY_PROGRAM).
- `package_name` (string, optional) - Package name for validation (optional but recommended).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="validatefunctionmodulelow-low-level-function"></a>
#### ValidateFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Validate an ABAP function module name before creation. Checks if the name is valid and available. Requires function group name. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleValidateFunctionModule.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, optional) - Optional description for validation
- `function_group_name` (string, required) - Function group name (e.g., Z_FUGR_TEST_0001)
- `function_module_name` (string, required) - Function module name to validate (e.g., Z_TEST_FM)
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-interface"></a>
### Low-Level / Interface

<a id="activateinterfacelow-low-level-interface"></a>
#### ActivateInterfaceLow (Low-Level / Interface)
**Description:** Operation: Activate, Create, Update. Subject: Interface. Will be useful for activating, creating, or updating interface. [low-level] Activate an ABAP interface. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/interface/low/handleActivateInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., ZIF_MY_INTERFACE).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkinterfacelow-low-level-interface"></a>
#### CheckInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Perform syntax check on an ABAP interface. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/interface/low/handleCheckInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="createinterfacelow-low-level-interface"></a>
#### CreateInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Create a new ABAP interface. - use CreateInterface (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/interface/low/handleCreateInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, required) - Interface description.
- `interface_name` (string, required) - Interface name (e.g., ZIF_TEST_INTERFACE). Must follow SAP naming conventions.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deleteinterfacelow-low-level-interface"></a>
#### DeleteInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Delete an ABAP interface from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/interface/low/handleDeleteInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockinterfacelow-low-level-interface"></a>
#### LockInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Lock an ABAP interface for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/interface/low/handleLockInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., ZIF_MY_INTERFACE).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockinterfacelow-low-level-interface"></a>
#### UnlockInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Unlock an ABAP interface after modification. Requires the lock_handle from LockInterface operation.

**Source:** `src/handlers/interface/low/handleUnlockInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_PROGRAM).
- `lock_handle` (string, required) - Lock handle from LockInterface operation.
- `session_id` (string, optional) - Session ID from LockInterface operation. Must be the same as used in LockInterface.
- `session_state` (object, optional) - Session state from LockInterface (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="updateinterfacelow-low-level-interface"></a>
#### UpdateInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Update source code of an existing ABAP interface. Requires lock handle from LockObject. - use UpdateInterface (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/interface/low/handleUpdateInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., ZIF_TEST_INTERFACE). Interface must already exist.
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `source_code` (string, required) - Complete ABAP interface source code.

---

<a id="validateinterfacelow-low-level-interface"></a>
#### ValidateInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Validate an ABAP interface name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/interface/low/handleValidateInterface.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, required) - Interface description. Required for validation.
- `interface_name` (string, required) - Interface name to validate (e.g., Z_MY_PROGRAM).
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-lockobject"></a>
### Low-Level / Lockobject

<a id="activatelockobject-low-level-lockobject"></a>
#### ActivateLockObject (Low-Level / Lockobject)
**Description:** Activate an ABAP lock object (ENQU). Use after CreateLockObject or UpdateLockObject; activation generates the ENQUEUE/DEQUEUE function modules.

**Source:** `src/handlers/lockobject/low/handleActivateLockObject.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `lock_object_name` (string, required) - Lock object name.

---

<a id="low-level-package"></a>
### Low-Level / Package

<a id="checkpackagelow-low-level-package"></a>
#### CheckPackageLow (Low-Level / Package)
**Description:** [low-level] Perform syntax check on an ABAP package. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/package/low/handleCheckPackage.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_0002).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `super_package` (string, required) - Super package (parent package) name (e.g., ZOK_PACKAGE). Required.

---

<a id="deletepackagelow-low-level-package"></a>
#### DeletePackageLow (Low-Level / Package)
**Description:** [low-level] Delete an ABAP package from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/package/low/handleDeletePackage.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `connection_config` (object, optional) - Optional SAP connection config to create a fresh connection for deletion. Useful when the existing connection config is unavailable.
- `force_new_connection` (boolean, optional) - Force creation of a new connection (bypass cache). Useful when package was locked/unlocked and needs to be deleted in a fresh session. Default: false.
- `package_name` (string, required) - Package name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockpackagelow-low-level-package"></a>
#### LockPackageLow (Low-Level / Package)
**Description:** [low-level] Lock an ABAP package for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id. Requires super_package.

**Source:** `src/handlers/package/low/handleLockPackage.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_0002).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `super_package` (string, required) - Super package (parent package) name (e.g., ZOK_PACKAGE). Required.

---

<a id="unlockpackagelow-low-level-package"></a>
#### UnlockPackageLow (Low-Level / Package)
**Description:** [low-level] Unlock an ABAP package after modification. Requires lock handle from LockObject and superPackage. - requires the lock_handle from LockObject.

**Source:** `src/handlers/package/low/handleUnlockPackage.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockObject operation
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_0002). Package must already exist.
- `session_id` (string, optional) - Session ID from LockObject operation. Must be the same as used in LockObject.
- `session_state` (object, optional) - Session state from LockObject (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `super_package` (string, required) - Super package (parent package) name. Required for package operations.

---

<a id="updatepackagelow-low-level-package"></a>
#### UpdatePackageLow (Low-Level / Package)
**Description:** [low-level] Update description of an existing ABAP package. Requires lock handle from LockObject and superPackage. - use UpdatePackageSource for full workflow with lock/unlock.

**Source:** `src/handlers/package/low/handleUpdatePackage.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_0002). Package must already exist.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `super_package` (string, required) - Super package (parent package) name. Required for package operations.
- `updated_description` (string, required) - New description for the package.

---

<a id="low-level-program"></a>
### Low-Level / Program

<a id="activateprogramlow-low-level-program"></a>
#### ActivateProgramLow (Low-Level / Program)
**Description:** Operation: Activate, Create, Update. Subject: Program. Will be useful for activating, creating, or updating program. [low-level] Activate an ABAP program. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/program/low/handleActivateProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkprogramlow-low-level-program"></a>
#### CheckProgramLow (Low-Level / Program)
**Description:** [low-level] Perform syntax check on an ABAP program. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/program/low/handleCheckProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="createprogramlow-low-level-program"></a>
#### CreateProgramLow (Low-Level / Program)
**Description:** [low-level] Create a new ABAP program. - use CreateProgram (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/program/low/handleCreateProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `application` (string, optional (default: *').)) - Application area (optional, default: '*').
- `description` (string, required) - Program description.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `program_name` (string, required) - Program name (e.g., Z_TEST_PROGRAM). Must follow SAP naming conventions.
- `program_type` (string, optional) - Program type: 'executable', 'include', 'module_pool', 'function_group', 'class_pool', 'interface_pool' (optional).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deleteprogramlow-low-level-program"></a>
#### DeleteProgramLow (Low-Level / Program)
**Description:** [low-level] Delete an ABAP program from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/program/low/handleDeleteProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockprogramlow-low-level-program"></a>
#### LockProgramLow (Low-Level / Program)
**Description:** [low-level] Lock an ABAP program for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/program/low/handleLockProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockprogramlow-low-level-program"></a>
#### UnlockProgramLow (Low-Level / Program)
**Description:** [low-level] Unlock an ABAP program after modification. Requires the lock_handle from LockProgram operation.

**Source:** `src/handlers/program/low/handleUnlockProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockProgram operation.
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from LockProgram operation. Must be the same as used in LockProgram.
- `session_state` (object, optional) - Session state from LockProgram (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="updateprogramlow-low-level-program"></a>
#### UpdateProgramLow (Low-Level / Program)
**Description:** [low-level] Update source code of an existing ABAP program. Requires lock handle from LockObject. - use UpdateProgram (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/program/low/handleUpdateProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `program_name` (string, required) - Program name (e.g., Z_TEST_PROGRAM). Program must already exist.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `source_code` (string, required) - Complete ABAP program source code.

---

<a id="validateprogramlow-low-level-program"></a>
#### ValidateProgramLow (Low-Level / Program)
**Description:** [low-level] Validate an ABAP program name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/program/low/handleValidateProgram.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, required) - Program description. Required for validation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `program_name` (string, required) - Program name to validate (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-view"></a>
### Low-Level / View

<a id="activateviewlow-low-level-view"></a>
#### ActivateViewLow (Low-Level / View)
**Description:** Operation: Activate, Create, Update. Subject: View. Will be useful for activating, creating, or updating view. [low-level] Activate an ABAP view (CDS view). Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/view/low/handleActivateView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `view_name` (string, required) - View name (e.g., ZVW_MY_VIEW).

---

<a id="checkviewlow-low-level-view"></a>
#### CheckViewLow (Low-Level / View)
**Description:** [low-level] Perform syntax check on an ABAP view. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session. If ddl_source is provided, validates new/unsaved code (will be base64 encoded in request).

**Source:** `src/handlers/view/low/handleCheckView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `ddl_source` (string, optional) - Optional DDL to check INSTEAD of the stored version. The object must ALREADY EXIST. Note this parameter was accepted and then silently DROPPED before 2026-08-26 for tables and structures (the dependency hardcoded no-source), so a verdict from an older build described the stored version, not this DDL.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `version` (string, optional) - Version to check: 'active' (last activated) or 'inactive' (current unsaved). Default: active — a DDIC object with no inactive version cannot be checked as 'inactive'.
- `view_name` (string, required) - View name (e.g., Z_MY_PROGRAM).

---

<a id="createviewlow-low-level-view"></a>
#### CreateViewLow (Low-Level / View)
**Description:** [low-level] Create a new ABAP view. - use CreateView (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/view/low/handleCreateView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `application` (string, optional (default: *').)) - Application area (optional, default: '*').
- `description` (string, required) - View description.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.
- `view_name` (string, required) - View name (e.g., Z_TEST_PROGRAM). Must follow SAP naming conventions.
- `view_type` (string, optional) - View type: 'executable', 'include', 'module_pool', 'function_group', 'class_pool', 'interface_pool' (optional).

---

<a id="deleteviewlow-low-level-view"></a>
#### DeleteViewLow (Low-Level / View)
**Description:** [low-level] Delete an ABAP view from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/view/low/handleDeleteView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).
- `view_name` (string, required) - View name (e.g., Z_MY_PROGRAM).

---

<a id="lockviewlow-low-level-view"></a>
#### LockViewLow (Low-Level / View)
**Description:** [low-level] Lock an ABAP view for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/view/low/handleLockView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `view_name` (string, required) - View name (e.g., Z_MY_PROGRAM).

---

<a id="unlockviewlow-low-level-view"></a>
#### UnlockViewLow (Low-Level / View)
**Description:** [low-level] Unlock an ABAP view after modification. Requires the lock_handle from LockView operation.

**Source:** `src/handlers/view/low/handleUnlockView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockView operation.
- `session_id` (string, optional) - Session ID from LockView operation. Must be the same as used in LockView.
- `session_state` (object, optional) - Session state from LockView (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `view_name` (string, required) - View name (e.g., Z_MY_PROGRAM).

---

<a id="updateviewlow-low-level-view"></a>
#### UpdateViewLow (Low-Level / View)
**Description:** [low-level] Update DDL source code of an existing CDS View or Classic View. Requires lock handle from LockObject. - use UpdateView (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/view/low/handleUpdateView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `ddl_source` (string, required) - Complete DDL source code. CDS: include @AbapCatalog.sqlViewName and other annotations. Classic: plain 'define view' statement.
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `view_name` (string, required) - View name (e.g., ZOK_R_TEST_0002). View must already exist.

---

<a id="validateviewlow-low-level-view"></a>
#### ValidateViewLow (Low-Level / View)
**Description:** [low-level] Validate an ABAP view name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/view/low/handleValidateView.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `description` (string, required) - View description. Required for validation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `view_name` (string, required) - View name to validate (e.g., Z_MY_PROGRAM).

---

<a id="low-level-xslt"></a>
### Low-Level / Xslt

<a id="activatexslt-low-level-xslt"></a>
#### ActivateXslt (Low-Level / Xslt)
**Description:** Activate an ABAP transformation (XSLT). Use after CreateXslt or UpdateXslt if it remains inactive.

**Source:** `src/handlers/xslt/low/handleActivateXslt.ts`

**Available in:** `onprem`, `legacy`

**Parameters:**
- `xslt_name` (string, required) - Transformation name.

---

*Last updated: 2026-11-09*
