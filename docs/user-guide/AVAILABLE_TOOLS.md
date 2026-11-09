# Available Tools Reference - MCP ABAP ADT Server

Generated from code in `src/handlers/**` (not from docs).

## Summary

- Total tools: 377
- Read-only tools: 79
- High-level tools: 171
- Low-level tools: 127

- Compact tools: 27 (included in High-level group)

## Handler Sets

- `readonly` -> [Read-Only Group](#read-only-group)
- `high` -> [High-Level Group](#high-level-group)
- `low` -> [Low-Level Group](#low-level-group)
- `compact` -> [High-Level / Compact](#high-level-compact)

## Navigation

- [Compact Set](#high-level-compact)
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
- [Low-Level Group](#low-level-group)
  - [Access Control](#low-level-access-control)
    - [ActivateAccessControl](#activateaccesscontrol-low-level-access-control)
  - [Behavior Definition](#low-level-behavior-definition)
    - [ActivateBehaviorDefinitionLow](#activatebehaviordefinitionlow-low-level-behavior-definition)
    - [CheckBdefLow](#checkbdeflow-low-level-behavior-definition)
    - [CreateBehaviorDefinitionLow](#createbehaviordefinitionlow-low-level-behavior-definition)
    - [DeleteBehaviorDefinitionLow](#deletebehaviordefinitionlow-low-level-behavior-definition)
    - [LockBehaviorDefinitionLow](#lockbehaviordefinitionlow-low-level-behavior-definition)
    - [UnlockBehaviorDefinitionLow](#unlockbehaviordefinitionlow-low-level-behavior-definition)
    - [UpdateBehaviorDefinitionLow](#updatebehaviordefinitionlow-low-level-behavior-definition)
    - [ValidateBehaviorDefinitionLow](#validatebehaviordefinitionlow-low-level-behavior-definition)
  - [Behavior Implementation](#low-level-behavior-implementation)
    - [CreateBehaviorImplementationLow](#createbehaviorimplementationlow-low-level-behavior-implementation)
    - [LockBehaviorImplementationLow](#lockbehaviorimplementationlow-low-level-behavior-implementation)
    - [ValidateBehaviorImplementationLow](#validatebehaviorimplementationlow-low-level-behavior-implementation)
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
    - [CheckObjectLow](#checkobjectlow-low-level-common)
    - [DeleteObjectLow](#deleteobjectlow-low-level-common)
    - [LockObjectLow](#lockobjectlow-low-level-common)
    - [UnlockObjectLow](#unlockobjectlow-low-level-common)
    - [ValidateObjectLow](#validateobjectlow-low-level-common)
  - [Data Element](#low-level-data-element)
    - [ActivateDataElementLow](#activatedataelementlow-low-level-data-element)
    - [CheckDataElementLow](#checkdataelementlow-low-level-data-element)
    - [CreateDataElementLow](#createdataelementlow-low-level-data-element)
    - [DeleteDataElementLow](#deletedataelementlow-low-level-data-element)
    - [LockDataElementLow](#lockdataelementlow-low-level-data-element)
    - [UnlockDataElementLow](#unlockdataelementlow-low-level-data-element)
    - [UpdateDataElementLow](#updatedataelementlow-low-level-data-element)
    - [ValidateDataElementLow](#validatedataelementlow-low-level-data-element)
  - [Ddlx](#low-level-ddlx)
    - [ActivateMetadataExtensionLow](#activatemetadataextensionlow-low-level-ddlx)
    - [CheckMetadataExtensionLow](#checkmetadataextensionlow-low-level-ddlx)
    - [CreateMetadataExtensionLow](#createmetadataextensionlow-low-level-ddlx)
    - [DeleteMetadataExtensionLow](#deletemetadataextensionlow-low-level-ddlx)
    - [LockMetadataExtensionLow](#lockmetadataextensionlow-low-level-ddlx)
    - [UnlockMetadataExtensionLow](#unlockmetadataextensionlow-low-level-ddlx)
    - [UpdateMetadataExtensionLow](#updatemetadataextensionlow-low-level-ddlx)
    - [ValidateMetadataExtensionLow](#validatemetadataextensionlow-low-level-ddlx)
  - [Domain](#low-level-domain)
    - [ActivateDomainLow](#activatedomainlow-low-level-domain)
    - [CheckDomainLow](#checkdomainlow-low-level-domain)
    - [CreateDomainLow](#createdomainlow-low-level-domain)
    - [DeleteDomainLow](#deletedomainlow-low-level-domain)
    - [LockDomainLow](#lockdomainlow-low-level-domain)
    - [UnlockDomainLow](#unlockdomainlow-low-level-domain)
    - [UpdateDomainLow](#updatedomainlow-low-level-domain)
    - [ValidateDomainLow](#validatedomainlow-low-level-domain)
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
    - [CreatePackageLow](#createpackagelow-low-level-package)
    - [DeletePackageLow](#deletepackagelow-low-level-package)
    - [LockPackageLow](#lockpackagelow-low-level-package)
    - [UnlockPackageLow](#unlockpackagelow-low-level-package)
    - [UpdatePackageLow](#updatepackagelow-low-level-package)
    - [ValidatePackageLow](#validatepackagelow-low-level-package)
  - [Program](#low-level-program)
    - [ActivateProgramLow](#activateprogramlow-low-level-program)
    - [CheckProgramLow](#checkprogramlow-low-level-program)
    - [CreateProgramLow](#createprogramlow-low-level-program)
    - [DeleteProgramLow](#deleteprogramlow-low-level-program)
    - [LockProgramLow](#lockprogramlow-low-level-program)
    - [UnlockProgramLow](#unlockprogramlow-low-level-program)
    - [UpdateProgramLow](#updateprogramlow-low-level-program)
    - [ValidateProgramLow](#validateprogramlow-low-level-program)
  - [Service Binding](#low-level-service-binding)
    - [ActivateServiceBindingLow](#activateservicebindinglow-low-level-service-binding)
  - [Service Definition](#low-level-service-definition)
    - [ActivateServiceDefinitionLow](#activateservicedefinitionlow-low-level-service-definition)
  - [Structure](#low-level-structure)
    - [ActivateStructureLow](#activatestructurelow-low-level-structure)
    - [CheckStructureLow](#checkstructurelow-low-level-structure)
    - [CreateStructureLow](#createstructurelow-low-level-structure)
    - [DeleteStructureLow](#deletestructurelow-low-level-structure)
    - [LockStructureLow](#lockstructurelow-low-level-structure)
    - [UnlockStructureLow](#unlockstructurelow-low-level-structure)
    - [UpdateStructureLow](#updatestructurelow-low-level-structure)
    - [ValidateStructureLow](#validatestructurelow-low-level-structure)
  - [System](#low-level-system)
    - [GetNodeStructureLow](#getnodestructurelow-low-level-system)
    - [GetObjectStructureLow](#getobjectstructurelow-low-level-system)
    - [GetVirtualFoldersLow](#getvirtualfolderslow-low-level-system)
  - [Table](#low-level-table)
    - [ActivateTableLow](#activatetablelow-low-level-table)
    - [CheckTableLow](#checktablelow-low-level-table)
    - [CreateTableLow](#createtablelow-low-level-table)
    - [DeleteTableLow](#deletetablelow-low-level-table)
    - [LockTableLow](#locktablelow-low-level-table)
    - [UnlockTableLow](#unlocktablelow-low-level-table)
    - [UpdateTableLow](#updatetablelow-low-level-table)
    - [ValidateTableLow](#validatetablelow-low-level-table)
  - [Transport](#low-level-transport)
    - [CreateTransportLow](#createtransportlow-low-level-transport)
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

<a id="low-level-group"></a>
## Low-Level Group

<a id="low-level-access-control"></a>
### Low-Level / Access Control

<a id="activateaccesscontrol-low-level-access-control"></a>
#### ActivateAccessControl (Low-Level / Access Control)
**Description:** Operation: Activate. Subject: Access Control (DCL / DCLS). Activate a DCL that is still inactive (e.g. after UpdateAccessControl with activate=false). Success is derived from SAP’s own messages, so a refused activation is reported as a failure.

**Source:** `src/handlers/access_control/low/handleActivateAccessControl.ts`

**Parameters:**
- `access_control_name` (string, required) - DCL name.

---

<a id="low-level-behavior-definition"></a>
### Low-Level / Behavior Definition

<a id="activatebehaviordefinitionlow-low-level-behavior-definition"></a>
#### ActivateBehaviorDefinitionLow (Low-Level / Behavior Definition)
**Description:** Operation: Activate, Create, Update. Subject: BehaviorDefinition. Will be useful for activating, creating, or updating behavior definition. [low-level] Activate an ABAP behavior definition. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/behavior_definition/low/handleActivateBehaviorDefinition.ts`

**Parameters:**
- `name` (string, required) - Behavior definition name (root entity, e.g., ZI_MY_ENTITY).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkbdeflow-low-level-behavior-definition"></a>
#### CheckBdefLow (Low-Level / Behavior Definition)
**Description:** [low-level] Perform syntax check on an ABAP behavior definition. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/behavior_definition/low/handleCheckBehaviorDefinition.ts`

**Parameters:**
- `name` (string, required) - BehaviorDefinition name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="createbehaviordefinitionlow-low-level-behavior-definition"></a>
#### CreateBehaviorDefinitionLow (Low-Level / Behavior Definition)
**Description:** [low-level] Create a new ABAP Behavior Definition. - use CreateBehaviorDefinition (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/behavior_definition/low/handleCreateBehaviorDefinition.ts`

**Parameters:**
- `description` (string, required) - Behavior Definition description.
- `implementation_type` (string, required) - Implementation type: 'Managed', 'Unmanaged', 'Abstract', or 'Projection'.
- `name` (string, required) - Behavior Definition name (e.g., ZI_MY_BDEF).
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `root_entity` (string, required) - Root entity name (e.g., ZI_MY_ENTITY).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required.

---

<a id="deletebehaviordefinitionlow-low-level-behavior-definition"></a>
#### DeleteBehaviorDefinitionLow (Low-Level / Behavior Definition)
**Description:** [low-level] Delete an ABAP behavior definition from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/behavior_definition/low/handleDeleteBehaviorDefinition.ts`

**Parameters:**
- `name` (string, required) - BehaviorDefinition name (e.g., ZI_MY_BDEF).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockbehaviordefinitionlow-low-level-behavior-definition"></a>
#### LockBehaviorDefinitionLow (Low-Level / Behavior Definition)
**Description:** [low-level] Lock an ABAP behavior definition for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/behavior_definition/low/handleLockBehaviorDefinition.ts`

**Parameters:**
- `name` (string, required) - BehaviorDefinition name (e.g., ZI_MY_BDEF).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockbehaviordefinitionlow-low-level-behavior-definition"></a>
#### UnlockBehaviorDefinitionLow (Low-Level / Behavior Definition)
**Description:** [low-level] Unlock an ABAP behavior definition after modification. Requires the lock_handle from LockBehaviorDefinition operation.

**Source:** `src/handlers/behavior_definition/low/handleUnlockBehaviorDefinition.ts`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockBehaviorDefinition operation.
- `name` (string, required) - BehaviorDefinition name (e.g., ZI_MY_BDEF).
- `session_id` (string, optional) - Session ID from LockBehaviorDefinition operation. Must be the same as used in LockBehaviorDefinition.
- `session_state` (object, optional) - Session state from LockBehaviorDefinition (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="updatebehaviordefinitionlow-low-level-behavior-definition"></a>
#### UpdateBehaviorDefinitionLow (Low-Level / Behavior Definition)
**Description:** [low-level] Update source code of an existing ABAP behavior definition. Requires lock handle from LockObject. - use UpdateBehaviorDefinition (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/behavior_definition/low/handleUpdateBehaviorDefinition.ts`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `name` (string, required) - Behavior definition name (e.g., ZOK_C_TEST_0001). Behavior definition must already exist.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `source_code` (string, required) - Complete behavior definition source code.
- `transport_request` (string, optional) - Transport request number (required for transportable packages).

---

<a id="validatebehaviordefinitionlow-low-level-behavior-definition"></a>
#### ValidateBehaviorDefinitionLow (Low-Level / Behavior Definition)
**Description:** [low-level] Validate an ABAP behavior definition name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/behavior_definition/low/handleValidateBehaviorDefinition.ts`

**Parameters:**
- `description` (string, required) - BehaviorDefinition description. Required for validation.
- `implementation_type` (string, required) - Implementation type: 'Managed', 'Unmanaged', 'Abstract', or 'Projection'.
- `name` (string, required) - BehaviorDefinition name to validate (e.g., ZI_MY_BDEF).
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `root_entity` (string, required) - Root entity name (e.g., ZI_MY_ENTITY). Required for validation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-behavior-implementation"></a>
### Low-Level / Behavior Implementation

<a id="createbehaviorimplementationlow-low-level-behavior-implementation"></a>
#### CreateBehaviorImplementationLow (Low-Level / Behavior Implementation)
**Description:** [low-level] Create a new ABAP behavior implementation class with full workflow (create, lock, update main source, update implementations, unlock, activate). - use CreateBehaviorImplementation (high-level) for additional validation.

**Source:** `src/handlers/behavior_implementation/low/handleCreateBehaviorImplementation.ts`

**Parameters:**
- `behavior_definition` (string, required) - Behavior Definition name (e.g., ZI_MY_ENTITY). Required.
- `class_name` (string, required) - Behavior Implementation class name (e.g., ZBP_MY_ENTITY). Must follow SAP naming conventions.
- `description` (string, required) - Class description.
- `implementation_code` (string, optional) - Implementation code for the implementations include (optional).
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="lockbehaviorimplementationlow-low-level-behavior-implementation"></a>
#### LockBehaviorImplementationLow (Low-Level / Behavior Implementation)
**Description:** [low-level] Lock an ABAP behavior implementation class for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/behavior_implementation/low/handleLockBehaviorImplementation.ts`

**Parameters:**
- `class_name` (string, required) - Behavior Implementation class name (e.g., ZBP_MY_ENTITY).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="validatebehaviorimplementationlow-low-level-behavior-implementation"></a>
#### ValidateBehaviorImplementationLow (Low-Level / Behavior Implementation)
**Description:** [low-level] Validate an ABAP behavior implementation class name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/behavior_implementation/low/handleValidateBehaviorImplementation.ts`

**Parameters:**
- `behavior_definition` (string, required) - Behavior Definition name (e.g., ZI_MY_ENTITY). Required for validation.
- `class_name` (string, required) - Behavior Implementation class name to validate (e.g., ZBP_MY_ENTITY).
- `description` (string, required) - Class description. Required for validation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-class"></a>
### Low-Level / Class

<a id="activateclasslow-low-level-class"></a>
#### ActivateClassLow (Low-Level / Class)
**Description:** Operation: Activate, Create, Update. Subject: Class. Will be useful for activating, creating, or updating class. [low-level] Activate an ABAP class. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/class/low/handleActivateClass.ts`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="activateclasstestclasseslow-low-level-class"></a>
#### ActivateClassTestClassesLow (Low-Level / Class)
**Description:** [low-level] Activate ABAP Unit test classes include for an existing class. Should be executed after updating and unlocking test classes.

**Source:** `src/handlers/class/low/handleActivateClassTestClasses.ts`

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

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="getclassunittestresultlow-low-level-class"></a>
#### GetClassUnitTestResultLow (Low-Level / Class)
**Description:** [low-level] Retrieve ABAP Unit run result (ABAPUnit or JUnit XML) for a completed run_id. NOTE: RunClassUnitTestsLow returns results synchronously; this targets the legacy async run and is generally not needed.

**Source:** `src/handlers/class/low/handleGetClassUnitTestResult.ts`

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

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).

---

<a id="lockclasstestclasseslow-low-level-class"></a>
#### LockClassTestClassesLow (Low-Level / Class)
**Description:** [low-level] Lock ABAP Unit test classes include (CLAS/OC testclasses) for the specified class. Returns a test_classes_lock_handle for subsequent update/unlock operations using the same session.

**Source:** `src/handlers/class/low/handleLockClassTestClasses.ts`

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="runclassunittestslow-low-level-class"></a>
#### RunClassUnitTestsLow (Low-Level / Class)
**Description:** [low-level] Start an ABAP Unit test run for provided class test definitions. Returns run_id extracted from SAP response headers.

**Source:** `src/handlers/class/low/handleRunClassUnitTests.ts`

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

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_MY_CLASS).
- `lock_handle` (string, required) - Lock handle from LockClass operation.

---

<a id="unlockclasstestclasseslow-low-level-class"></a>
#### UnlockClassTestClassesLow (Low-Level / Class)
**Description:** [low-level] Unlock ABAP Unit test classes include for a class using the test_classes_lock_handle obtained from LockClassTestClassesLow.

**Source:** `src/handlers/class/low/handleUnlockClassTestClasses.ts`

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

**Parameters:**
- `class_name` (string, required) - Class name (e.g., ZCL_TEST_CLASS_001). Class must already exist.
- `lock_handle` (string, required) - Lock handle from LockClass operation. Required for update operation.
- `source_code` (string, required) - Complete ABAP class source code including CLASS DEFINITION and IMPLEMENTATION sections.

---

<a id="updateclasstestclasseslow-low-level-class"></a>
#### UpdateClassTestClassesLow (Low-Level / Class)
**Description:** [low-level] Upload ABAP Unit test include source code for an existing class. Requires test_classes_lock_handle from LockClassTestClassesLow.

**Source:** `src/handlers/class/low/handleUpdateClassTestClasses.ts`

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

**Parameters:**
- `objects` (array, required) - Array of objects to activate. Each object must have 'name' and 'type'. URI is optional.
- `preaudit` (boolean, optional) - Request pre-audit before activation. Default: true

---

<a id="checkobjectlow-low-level-common"></a>
#### CheckObjectLow (Low-Level / Common)
**Description:** [low-level] Perform syntax check on an ABAP object without activation. Returns syntax errors, warnings, and messages.

**Source:** `src/handlers/common/low/handleCheckObject.ts`

**Parameters:**
- `object_name` (string, required) - Object name (e.g., ZCL_MY_CLASS, Z_MY_PROGRAM)
- `object_type` (string, required) - Object type
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `version` (string, optional) - Version to check: 'active' or 'inactive' (default active)

---

<a id="deleteobjectlow-low-level-common"></a>
#### DeleteObjectLow (Low-Level / Common)
**Description:** [low-level] Delete an ABAP object via ADT deletion API. Transport request optional for $TMP objects. Note: object_type "program" is onprem/legacy only — calling it on ABAP Cloud will fail.

**Source:** `src/handlers/common/low/handleDeleteObject.ts`

**Parameters:**
- `function_group_name` (string, optional) - Required only for function_module type
- `object_name` (string, required) - Object name (e.g., ZCL_MY_CLASS)
- `object_type` (string, required) - Object type. Supported: class, program (onprem/legacy only), interface, function_group, function_module, table, structure, table_type, view, domain, data_element, behavior_definition, metadata_extension. Also accepts ADT codes (clas/oc, prog/p, intf/oi, fugr/f, fugr/ff, tabl/dt, tabl/ds, ttyp/da, ddls/df, doma/dm, dtel/de, bdef/bd, ddlx/ex). For a high-level delete that VERIFIES the object is really gone, prefer the per-type Delete<Object> tools - ADT answers HTTP 200 even when it refuses a deletion.
- `transport_request` (string, optional) - Transport request number

---

<a id="lockobjectlow-low-level-common"></a>
#### LockObjectLow (Low-Level / Common)
**Description:** [low-level] Lock an ABAP object for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/common/low/handleLockObject.ts`

**Parameters:**
- `object_name` (string, required) - Object name (e.g., ZCL_MY_CLASS, Z_MY_PROGRAM, ZIF_MY_INTERFACE). For function modules, use format GROUP|FM_NAME
- `object_type` (string, required) - Object type
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `super_package` (string, optional) - Super package (required for package locking)

---

<a id="unlockobjectlow-low-level-common"></a>
#### UnlockObjectLow (Low-Level / Common)
**Description:** [low-level] Unlock an ABAP object after modification. Requires the lock_handle from the LockObject operation.

**Source:** `src/handlers/common/low/handleUnlockObject.ts`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockObject operation
- `object_name` (string, required) - Object name (e.g., ZCL_MY_CLASS, Z_MY_PROGRAM, ZIF_MY_INTERFACE). For function modules, use format GROUP|FM_NAME
- `object_type` (string, required) - Object type
- `session_id` (string, optional) - Session ID from LockObject operation. Must be the same session.
- `session_state` (object, optional) - Session state from LockObject (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="validateobjectlow-low-level-common"></a>
#### ValidateObjectLow (Low-Level / Common)
**Description:** [low-level] Validate an ABAP object name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/common/low/handleValidateObject.ts`

**Parameters:**
- `behavior_definition` (string, optional) - Optional behavior definition name (required for behavior_implementation validation)
- `description` (string, optional) - Optional description for validation
- `implementation_type` (string, optional) - Implementation type: 'Managed', 'Unmanaged', or 'External' (required for behavior_definition validation)
- `object_name` (string, required) - Object name to validate (e.g., ZCL_MY_CLASS, Z_MY_PROGRAM, ZIF_MY_INTERFACE)
- `object_type` (string, required) - Object type: 'class', 'program', 'interface', 'function_group', 'table', 'structure', 'view', 'domain', 'data_element', 'package', 'behavior_definition', 'behavior_implementation', 'metadata_extension'
- `package_name` (string, optional) - Optional package name for validation
- `root_entity` (string, optional) - Root entity name (required for behavior_definition validation)
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-data-element"></a>
### Low-Level / Data Element

<a id="activatedataelementlow-low-level-data-element"></a>
#### ActivateDataElementLow (Low-Level / Data Element)
**Description:** Operation: Activate, Create, Update. Subject: DataElement. Will be useful for activating, creating, or updating data element. [low-level] Activate an ABAP data element. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/data_element/low/handleActivateDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - Data element name (e.g., ZDT_MY_ELEMENT).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkdataelementlow-low-level-data-element"></a>
#### CheckDataElementLow (Low-Level / Data Element)
**Description:** [low-level] Perform syntax check on an ABAP data element. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/data_element/low/handleCheckDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - DataElement name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="createdataelementlow-low-level-data-element"></a>
#### CreateDataElementLow (Low-Level / Data Element)
**Description:** [low-level] Create a new ABAP data element. - use CreateDataElement (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/data_element/low/handleCreateDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - DataElement name (e.g., Z_TEST_PROGRAM). Must follow SAP naming conventions.
- `data_type` (string, optional) - Data type (e.g., CHAR, NUMC) or domain name when type_kind is 'E' or 'domain'.
- `decimals` (number, optional) - Decimal places (for predefinedAbapType or refToPredefinedAbapType)
- `description` (string, required) - DataElement description.
- `length` (number, optional) - Data type length (for predefinedAbapType or refToPredefinedAbapType)
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.
- `type_kind` (string, optional) - Type kind: 'E' for domain-based, 'P' for predefined type, etc.
- `type_name` (string, optional) - Type name: domain name (when type_kind is 'domain'), data element name (when type_kind is 'refToDictionaryType'), or class name (when type_kind is 'refToClifType')

---

<a id="deletedataelementlow-low-level-data-element"></a>
#### DeleteDataElementLow (Low-Level / Data Element)
**Description:** [low-level] Delete an ABAP data element from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/data_element/low/handleDeleteDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - DataElement name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockdataelementlow-low-level-data-element"></a>
#### LockDataElementLow (Low-Level / Data Element)
**Description:** [low-level] Lock an ABAP data element for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/data_element/low/handleLockDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - DataElement name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockdataelementlow-low-level-data-element"></a>
#### UnlockDataElementLow (Low-Level / Data Element)
**Description:** [low-level] Unlock an ABAP data element after modification. Requires the lock_handle from LockDataElement operation.

**Source:** `src/handlers/data_element/low/handleUnlockDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - DataElement name (e.g., Z_MY_PROGRAM).
- `lock_handle` (string, required) - Lock handle from LockDataElement operation.
- `session_id` (string, optional) - Session ID from LockDataElement operation. Must be the same as used in LockDataElement.
- `session_state` (object, optional) - Session state from LockDataElement (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="updatedataelementlow-low-level-data-element"></a>
#### UpdateDataElementLow (Low-Level / Data Element)
**Description:** [low-level] Update properties of an existing ABAP data element. Requires lock handle from LockObject. - use UpdateDataElement (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/data_element/low/handleUpdateDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - Data element name (e.g., ZOK_E_TEST_0001). Data element must already exist.
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `properties` (object, required) - Data element properties object. Can include: description, type_name, type_kind, data_type, field_label_short, field_label_medium, field_label_long, etc.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="validatedataelementlow-low-level-data-element"></a>
#### ValidateDataElementLow (Low-Level / Data Element)
**Description:** [low-level] Validate an ABAP data element name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/data_element/low/handleValidateDataElement.ts`

**Parameters:**
- `data_element_name` (string, required) - DataElement name to validate (e.g., Z_MY_PROGRAM).
- `description` (string, required) - DataElement description. Required for validation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-ddlx"></a>
### Low-Level / Ddlx

<a id="activatemetadataextensionlow-low-level-ddlx"></a>
#### ActivateMetadataExtensionLow (Low-Level / Ddlx)
**Description:** Operation: Activate, Create, Update. Subject: MetadataExtension. Will be useful for activating, creating, or updating metadata extension. [low-level] Activate an ABAP metadata extension. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/ddlx/low/handleActivateMetadataExtension.ts`

**Parameters:**
- `name` (string, required) - Metadata extension name (e.g., ZC_MY_EXTENSION).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkmetadataextensionlow-low-level-ddlx"></a>
#### CheckMetadataExtensionLow (Low-Level / Ddlx)
**Description:** [low-level] Perform syntax check on an ABAP metadata extension. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/ddlx/low/handleCheckMetadataExtension.ts`

**Parameters:**
- `name` (string, required) - MetadataExtension name (e.g., ZI_MY_DDLX).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="createmetadataextensionlow-low-level-ddlx"></a>
#### CreateMetadataExtensionLow (Low-Level / Ddlx)
**Description:** [low-level] Create a new ABAP Metadata Extension. - use CreateMetadataExtension (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/ddlx/low/handleCreateMetadataExtension.ts`

**Parameters:**
- `description` (string, required) - Metadata Extension description.
- `master_language` (string, optional) - Master language (optional, e.g., 'EN').
- `name` (string, required) - Metadata Extension name (e.g., ZI_MY_DDLX).
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional for local objects.

---

<a id="deletemetadataextensionlow-low-level-ddlx"></a>
#### DeleteMetadataExtensionLow (Low-Level / Ddlx)
**Description:** [low-level] Delete an ABAP metadata extension from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/ddlx/low/handleDeleteMetadataExtension.ts`

**Parameters:**
- `name` (string, required) - MetadataExtension name (e.g., ZI_MY_DDLX).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockmetadataextensionlow-low-level-ddlx"></a>
#### LockMetadataExtensionLow (Low-Level / Ddlx)
**Description:** [low-level] Lock an ABAP metadata extension for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/ddlx/low/handleLockMetadataExtension.ts`

**Parameters:**
- `name` (string, required) - MetadataExtension name (e.g., ZI_MY_DDLX).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockmetadataextensionlow-low-level-ddlx"></a>
#### UnlockMetadataExtensionLow (Low-Level / Ddlx)
**Description:** [low-level] Unlock an ABAP metadata extension after modification. Requires the lock_handle from LockMetadataExtension operation.

**Source:** `src/handlers/ddlx/low/handleUnlockMetadataExtension.ts`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockMetadataExtension operation.
- `name` (string, required) - MetadataExtension name (e.g., ZI_MY_DDLX).
- `session_id` (string, optional) - Session ID from LockMetadataExtension operation. Must be the same as used in LockMetadataExtension.
- `session_state` (object, optional) - Session state from LockMetadataExtension (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="updatemetadataextensionlow-low-level-ddlx"></a>
#### UpdateMetadataExtensionLow (Low-Level / Ddlx)
**Description:** [low-level] Update source code of an existing ABAP metadata extension. Requires lock handle from LockObject. - use UpdateMetadataExtension (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/ddlx/low/handleUpdateMetadataExtension.ts`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `name` (string, required) - Metadata extension name (e.g., ZOK_C_TEST_0001). Metadata extension must already exist.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `source_code` (string, required) - Complete metadata extension source code.

---

<a id="validatemetadataextensionlow-low-level-ddlx"></a>
#### ValidateMetadataExtensionLow (Low-Level / Ddlx)
**Description:** [low-level] Validate an ABAP metadata extension name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/ddlx/low/handleValidateMetadataExtension.ts`

**Parameters:**
- `description` (string, required) - MetadataExtension description.
- `name` (string, required) - MetadataExtension name to validate (e.g., ZI_MY_DDLX).
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-domain"></a>
### Low-Level / Domain

<a id="activatedomainlow-low-level-domain"></a>
#### ActivateDomainLow (Low-Level / Domain)
**Description:** Operation: Activate, Create, Update. Subject: Domain. Will be useful for activating, creating, or updating domain. [low-level] Activate an ABAP domain. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/domain/low/handleActivateDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., ZDM_MY_DOMAIN).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkdomainlow-low-level-domain"></a>
#### CheckDomainLow (Low-Level / Domain)
**Description:** [low-level] Perform syntax check on an ABAP domain. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/domain/low/handleCheckDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="createdomainlow-low-level-domain"></a>
#### CreateDomainLow (Low-Level / Domain)
**Description:** [low-level] Create a new ABAP domain. - use CreateDomain (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/domain/low/handleCreateDomain.ts`

**Parameters:**
- `description` (string, required) - Domain description.
- `domain_name` (string, required) - Domain name (e.g., Z_TEST_PROGRAM). Must follow SAP naming conventions.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deletedomainlow-low-level-domain"></a>
#### DeleteDomainLow (Low-Level / Domain)
**Description:** [low-level] Delete an ABAP domain from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/domain/low/handleDeleteDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockdomainlow-low-level-domain"></a>
#### LockDomainLow (Low-Level / Domain)
**Description:** [low-level] Lock an ABAP domain for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/domain/low/handleLockDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockdomainlow-low-level-domain"></a>
#### UnlockDomainLow (Low-Level / Domain)
**Description:** [low-level] Unlock an ABAP domain after modification. Requires the lock_handle from LockDomain operation.

**Source:** `src/handlers/domain/low/handleUnlockDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., Z_MY_PROGRAM).
- `lock_handle` (string, required) - Lock handle from LockDomain operation.
- `session_id` (string, optional) - Session ID from LockDomain operation. Must be the same as used in LockDomain.
- `session_state` (object, optional) - Session state from LockDomain (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="updatedomainlow-low-level-domain"></a>
#### UpdateDomainLow (Low-Level / Domain)
**Description:** [low-level] Update properties of an existing ABAP domain. Requires lock handle from LockObject. - use UpdateDomain (high-level) for full workflow with lock/unlock/activate.

**Source:** `src/handlers/domain/low/handleUpdateDomain.ts`

**Parameters:**
- `domain_name` (string, required) - Domain name (e.g., ZOK_D_TEST_0001). Domain must already exist.
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `properties` (object, required) - Domain properties object. Can include: description, datatype, length, decimals, conversion_exit, lowercase, sign_exists, value_table, fixed_values, etc.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="validatedomainlow-low-level-domain"></a>
#### ValidateDomainLow (Low-Level / Domain)
**Description:** [low-level] Validate an ABAP domain name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/domain/low/handleValidateDomain.ts`

**Parameters:**
- `description` (string, required) - Domain description (required for validation).
- `domain_name` (string, required) - Domain name to validate (e.g., Z_MY_PROGRAM).
- `package_name` (string, required) - Package name (required for validation).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-function"></a>
### Low-Level / Function

<a id="activatefunctiongrouplow-low-level-function"></a>
#### ActivateFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Activate an ABAP function group. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleActivateFunctionGroup.ts`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., Z_FG_TEST).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="activatefunctionmodulelow-low-level-function"></a>
#### ActivateFunctionModuleLow (Low-Level / Function)
**Description:** Operation: Activate, Create, Update. Subject: FunctionModule. Will be useful for activating, creating, or updating function module. [low-level] Activate an ABAP function module. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleActivateFunctionModule.ts`

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

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkfunctionmodulelow-low-level-function"></a>
#### CheckFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Perform syntax check on an ABAP function module. Returns syntax errors, warnings, and messages. Requires function group name. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/function/low/handleCheckFunctionModule.ts`

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

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="deletefunctionmodulelow-low-level-function"></a>
#### DeleteFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Delete an ABAP function module from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/function/low/handleDeleteFunctionModule.ts`

**Parameters:**
- `function_group_name` (string, required) - Function group name (e.g., ZFG_MY_GROUP).
- `function_module_name` (string, required) - Function module name (e.g., Z_MY_FUNCTION).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockfunctiongrouplow-low-level-function"></a>
#### LockFunctionGroupLow (Low-Level / Function)
**Description:** [low-level] Lock an ABAP function group for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/function/low/handleLockFunctionGroup.ts`

**Parameters:**
- `function_group_name` (string, required) - FunctionGroup name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="lockfunctionmodulelow-low-level-function"></a>
#### LockFunctionModuleLow (Low-Level / Function)
**Description:** [low-level] Lock an ABAP function module for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/function/low/handleLockFunctionModule.ts`

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

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., ZIF_MY_INTERFACE).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkinterfacelow-low-level-interface"></a>
#### CheckInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Perform syntax check on an ABAP interface. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/interface/low/handleCheckInterface.ts`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="createinterfacelow-low-level-interface"></a>
#### CreateInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Create a new ABAP interface. - use CreateInterface (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/interface/low/handleCreateInterface.ts`

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

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockinterfacelow-low-level-interface"></a>
#### LockInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Lock an ABAP interface for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/interface/low/handleLockInterface.ts`

**Parameters:**
- `interface_name` (string, required) - Interface name (e.g., ZIF_MY_INTERFACE).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockinterfacelow-low-level-interface"></a>
#### UnlockInterfaceLow (Low-Level / Interface)
**Description:** [low-level] Unlock an ABAP interface after modification. Requires the lock_handle from LockInterface operation.

**Source:** `src/handlers/interface/low/handleUnlockInterface.ts`

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

**Parameters:**
- `lock_object_name` (string, required) - Lock object name.

---

<a id="low-level-package"></a>
### Low-Level / Package

<a id="checkpackagelow-low-level-package"></a>
#### CheckPackageLow (Low-Level / Package)
**Description:** [low-level] Perform syntax check on an ABAP package. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/package/low/handleCheckPackage.ts`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_0002).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `super_package` (string, required) - Super package (parent package) name (e.g., ZOK_PACKAGE). Required.

---

<a id="createpackagelow-low-level-package"></a>
#### CreatePackageLow (Low-Level / Package)
**Description:** [low-level] Create a new ABAP package. - use CreatePackage (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/package/low/handleCreatePackage.ts`

**Parameters:**
- `application_component` (string, optional) - Application component (e.g., BC-ABA).
- `description` (string, required) - Package description.
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_0002). Must follow SAP naming conventions.
- `package_type` (string, optional) - Package type (development/structure). Defaults to development.
- `record_changes` (boolean, optional) - Enable change recording for the package. Required for transportable packages (non-$TMP). Default: false.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `software_component` (string, optional) - Software component (e.g., HOME, ZLOCAL). If not provided, SAP will set a default (typically ZLOCAL for local packages).
- `super_package` (string, required) - Super package (parent package) name (e.g., ZOK_PACKAGE). Required.
- `transport_layer` (string, optional) - Transport layer (e.g., ZDEV). Required for transportable packages.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deletepackagelow-low-level-package"></a>
#### DeletePackageLow (Low-Level / Package)
**Description:** [low-level] Delete an ABAP package from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/package/low/handleDeletePackage.ts`

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

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `package_name` (string, required) - Package name (e.g., ZOK_TEST_0002). Package must already exist.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `super_package` (string, required) - Super package (parent package) name. Required for package operations.
- `updated_description` (string, required) - New description for the package.

---

<a id="validatepackagelow-low-level-package"></a>
#### ValidatePackageLow (Low-Level / Package)
**Description:** [low-level] Validate an ABAP package name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/package/low/handleValidatePackage.ts`

**Parameters:**
- `package_name` (string, required) - Package name to validate (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `super_package` (string, required) - Parent (super) package name. The new package will be created under this package.

---

<a id="low-level-program"></a>
### Low-Level / Program

<a id="activateprogramlow-low-level-program"></a>
#### ActivateProgramLow (Low-Level / Program)
**Description:** Operation: Activate, Create, Update. Subject: Program. Will be useful for activating, creating, or updating program. [low-level] Activate an ABAP program. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/program/low/handleActivateProgram.ts`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="checkprogramlow-low-level-program"></a>
#### CheckProgramLow (Low-Level / Program)
**Description:** [low-level] Perform syntax check on an ABAP program. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/program/low/handleCheckProgram.ts`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="createprogramlow-low-level-program"></a>
#### CreateProgramLow (Low-Level / Program)
**Description:** [low-level] Create a new ABAP program. - use CreateProgram (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/program/low/handleCreateProgram.ts`

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

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockprogramlow-low-level-program"></a>
#### LockProgramLow (Low-Level / Program)
**Description:** [low-level] Lock an ABAP program for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/program/low/handleLockProgram.ts`

**Parameters:**
- `program_name` (string, required) - Program name (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="unlockprogramlow-low-level-program"></a>
#### UnlockProgramLow (Low-Level / Program)
**Description:** [low-level] Unlock an ABAP program after modification. Requires the lock_handle from LockProgram operation.

**Source:** `src/handlers/program/low/handleUnlockProgram.ts`

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

**Parameters:**
- `description` (string, required) - Program description. Required for validation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `program_name` (string, required) - Program name to validate (e.g., Z_MY_PROGRAM).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-service-binding"></a>
### Low-Level / Service Binding

<a id="activateservicebindinglow-low-level-service-binding"></a>
#### ActivateServiceBindingLow (Low-Level / Service Binding)
**Description:** Operation: Activate, Create, Update. Subject: ServiceBinding. Will be useful for activating, creating, or updating service binding. [low-level] Activate an ABAP service binding. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/service_binding/low/handleActivateServiceBinding.ts`

**Parameters:**
- `name` (string, required) - Service binding name (e.g., ZSB_MY_SERVICE).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-service-definition"></a>
### Low-Level / Service Definition

<a id="activateservicedefinitionlow-low-level-service-definition"></a>
#### ActivateServiceDefinitionLow (Low-Level / Service Definition)
**Description:** Operation: Activate, Create, Update. Subject: ServiceDefinition. Will be useful for activating, creating, or updating service definition. [low-level] Activate an ABAP service definition. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/service_definition/low/handleActivateServiceDefinition.ts`

**Parameters:**
- `name` (string, required) - Service definition name (e.g., ZSD_MY_SERVICE).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="low-level-structure"></a>
### Low-Level / Structure

<a id="activatestructurelow-low-level-structure"></a>
#### ActivateStructureLow (Low-Level / Structure)
**Description:** Operation: Activate, Create, Update. Subject: Structure. Will be useful for activating, creating, or updating structure. [low-level] Activate an ABAP structure. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/structure/low/handleActivateStructure.ts`

**Parameters:**
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `structure_name` (string, required) - Structure name (e.g., ZST_MY_STRUCTURE).

---

<a id="checkstructurelow-low-level-structure"></a>
#### CheckStructureLow (Low-Level / Structure)
**Description:** [low-level] Perform syntax check on an ABAP structure. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session. If ddl_code is provided, validates new/unsaved code (will be base64 encoded in request).

**Source:** `src/handlers/structure/low/handleCheckStructure.ts`

**Parameters:**
- `ddl_code` (string, optional) - Optional DDL to check INSTEAD of the stored version. The object must ALREADY EXIST. Note this parameter was accepted and then silently DROPPED before 2026-08-26 for tables and structures (the dependency hardcoded no-source), so a verdict from an older build described the stored version, not this DDL.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `structure_name` (string, required) - Structure name (e.g., Z_MY_PROGRAM).
- `version` (string, optional) - Version to check: 'active' (last activated) or 'inactive' (current unsaved). Default: active — a DDIC object with no inactive version cannot be checked as 'inactive'.

---

<a id="createstructurelow-low-level-structure"></a>
#### CreateStructureLow (Low-Level / Structure)
**Description:** [low-level] Create a new ABAP structure. - use CreateStructure (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/structure/low/handleCreateStructure.ts`

**Parameters:**
- `application` (string, optional (default: *').)) - Application area (optional, default: '*').
- `description` (string, required) - Structure description.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `structure_name` (string, required) - Structure name (e.g., Z_TEST_PROGRAM). Must follow SAP naming conventions.
- `structure_type` (string, optional) - Structure type: 'executable', 'include', 'module_pool', 'function_group', 'class_pool', 'interface_pool' (optional).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deletestructurelow-low-level-structure"></a>
#### DeleteStructureLow (Low-Level / Structure)
**Description:** [low-level] Delete an ABAP structure from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/structure/low/handleDeleteStructure.ts`

**Parameters:**
- `structure_name` (string, required) - Structure name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="lockstructurelow-low-level-structure"></a>
#### LockStructureLow (Low-Level / Structure)
**Description:** [low-level] Lock an ABAP structure for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/structure/low/handleLockStructure.ts`

**Parameters:**
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `structure_name` (string, required) - Structure name (e.g., Z_MY_PROGRAM).

---

<a id="unlockstructurelow-low-level-structure"></a>
#### UnlockStructureLow (Low-Level / Structure)
**Description:** [low-level] Unlock an ABAP structure after modification. Requires the lock_handle from LockStructure operation.

**Source:** `src/handlers/structure/low/handleUnlockStructure.ts`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockStructure operation.
- `session_id` (string, optional) - Session ID from LockStructure operation. Must be the same as used in LockStructure.
- `session_state` (object, optional) - Session state from LockStructure (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `structure_name` (string, required) - Structure name (e.g., Z_MY_PROGRAM).

---

<a id="updatestructurelow-low-level-structure"></a>
#### UpdateStructureLow (Low-Level / Structure)
**Description:** [low-level] Update DDL source code of an existing ABAP structure. Requires lock handle from LockObject. - use UpdateStructureSource for full workflow with lock/unlock.

**Source:** `src/handlers/structure/low/handleUpdateStructure.ts`

**Parameters:**
- `ddl_code` (string, required) - Complete DDL source code for the structure definition.
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `structure_name` (string, required) - Structure name (e.g., ZZ_S_TEST_001). Structure must already exist.

---

<a id="validatestructurelow-low-level-structure"></a>
#### ValidateStructureLow (Low-Level / Structure)
**Description:** [low-level] Validate an ABAP structure name before creation. Checks if the name is valid and available. Returns validation result with success status and message. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/structure/low/handleValidateStructure.ts`

**Parameters:**
- `description` (string, required) - Structure description. Required for validation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `structure_name` (string, required) - Structure name to validate (e.g., Z_MY_PROGRAM).

---

<a id="low-level-system"></a>
### Low-Level / System

<a id="getnodestructurelow-low-level-system"></a>
#### GetNodeStructureLow (Low-Level / System)
**Description:** [low-level] Fetch node structure from ADT repository. Used for object tree navigation and structure discovery. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/system/low/handleGetNodeStructure.ts`

**Parameters:**
- `node_id` (string, optional (default: 0000" for root). Use to fetch child nodes.)) - Optional node ID (default: "0000" for root). Use to fetch child nodes.
- `parent_name` (string, required) - Parent object name
- `parent_type` (string, required) - Parent object type (e.g., "CLAS/OC", "PROG/P", "DEVC/K")
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `with_short_descriptions` (boolean, optional (default: true)) - Include short descriptions in response

---

<a id="getobjectstructurelow-low-level-system"></a>
#### GetObjectStructureLow (Low-Level / System)
**Description:** [low-level] Retrieve ADT object structure as compact JSON tree. Returns XML response with object structure tree. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/system/low/handleGetObjectStructure.ts`

**Parameters:**
- `object_name` (string, required) - Object name (e.g., "ZMY_CLASS", "ZMY_PROGRAM")
- `object_type` (string, required) - Object type (e.g., "CLAS/OC", "PROG/P", "DEVC/K", "DDLS/DF")
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.

---

<a id="getvirtualfolderslow-low-level-system"></a>
#### GetVirtualFoldersLow (Low-Level / System)
**Description:** [low-level] Retrieve hierarchical virtual folder contents from ADT information system. Used for browsing ABAP objects by package, group, type, etc.

**Source:** `src/handlers/system/low/handleGetVirtualFolders.ts`

**Parameters:**
- `facet_order` (array, optional (default: ['package)) - Order of facets in response (e.g., ["package", "group", "type"]). Default: ["package", "group", "type"]
- `ignore_short_descriptions` (boolean, optional (default: false)) - Ignore short descriptions in response
- `object_search_pattern` (string, optional (default: *)) - Object search pattern (e.g., "*", "Z*", "ZCL_*"). Default: "*"
- `preselection` (array, optional) - Optional preselection filters (facet-value pairs for filtering)
- `with_versions` (boolean, optional (default: false)) - Include version information in response

---

<a id="low-level-table"></a>
### Low-Level / Table

<a id="activatetablelow-low-level-table"></a>
#### ActivateTableLow (Low-Level / Table)
**Description:** Operation: Activate, Create, Update. Subject: Table. Will be useful for activating, creating, or updating table. [low-level] Activate an ABAP table. Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/table/low/handleActivateTable.ts`

**Parameters:**
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `table_name` (string, required) - Table name (e.g., ZTB_MY_TABLE).

---

<a id="checktablelow-low-level-table"></a>
#### CheckTableLow (Low-Level / Table)
**Description:** [low-level] Perform syntax check on an ABAP table. Returns syntax errors, warnings, and messages. Requires session_id for stateful operations. Can use session_id and session_state from GetSession to maintain the same session. If ddl_code is provided, validates new/unsaved code (will be base64 encoded in request).

**Source:** `src/handlers/table/low/handleCheckTable.ts`

**Parameters:**
- `ddl_code` (string, optional) - Optional DDL to check INSTEAD of the stored version. The object must ALREADY EXIST. Note this parameter was accepted and then silently DROPPED before 2026-08-26 for tables and structures (the dependency hardcoded no-source), so a verdict from an older build described the stored version, not this DDL.
- `reporter` (string, optional) - Check reporter: 'tableStatusCheck' or 'abapCheckRun'. Default: abapCheckRun
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `table_name` (string, required) - Table name (e.g., Z_MY_TABLE)
- `version` (string, optional) - Version to check: 'active' (last activated), 'inactive' (current unsaved), or 'new'.

---

<a id="createtablelow-low-level-table"></a>
#### CreateTableLow (Low-Level / Table)
**Description:** [low-level] Create a new ABAP table. - use CreateTable (high-level) for full workflow with validation, lock, update, check, unlock, and activate.

**Source:** `src/handlers/table/low/handleCreateTable.ts`

**Parameters:**
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects).
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `table_name` (string, required) - Table name (e.g., ZT_TEST_001). Must follow SAP naming conventions. MAX 16 characters — SAP silently truncates longer names, so an over-long name fails with a misleading "already exists" error.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable packages.

---

<a id="deletetablelow-low-level-table"></a>
#### DeleteTableLow (Low-Level / Table)
**Description:** [low-level] Delete an ABAP table from the SAP system via ADT deletion API. Transport request optional for $TMP objects.

**Source:** `src/handlers/table/low/handleDeleteTable.ts`

**Parameters:**
- `table_name` (string, required) - Table name (e.g., Z_MY_PROGRAM).
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).

---

<a id="locktablelow-low-level-table"></a>
#### LockTableLow (Low-Level / Table)
**Description:** [low-level] Lock an ABAP table for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/table/low/handleLockTable.ts`

**Parameters:**
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `table_name` (string, required) - Table name (e.g., Z_MY_PROGRAM).

---

<a id="unlocktablelow-low-level-table"></a>
#### UnlockTableLow (Low-Level / Table)
**Description:** [low-level] Unlock an ABAP table after modification. Must use the same session_id and lock_handle from LockTable operation.

**Source:** `src/handlers/table/low/handleUnlockTable.ts`

**Parameters:**
- `lock_handle` (string, required) - Lock handle from LockTable operation.
- `session_id` (string, required) - Session ID from LockTable operation. Must be the same as used in LockTable.
- `session_state` (object, optional) - Session state from LockTable (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `table_name` (string, required) - Table name (e.g., Z_MY_PROGRAM).

---

<a id="updatetablelow-low-level-table"></a>
#### UpdateTableLow (Low-Level / Table)
**Description:** [low-level] Update DDL source code of an existing ABAP table. Requires lock handle from LockObject. - use CreateTable for full workflow with lock/unlock.

**Source:** `src/handlers/table/low/handleUpdateTable.ts`

**Parameters:**
- `ddl_code` (string, required) - Complete DDL source code for the table definition.
- `lock_handle` (string, required) - Lock handle from LockObject. Required for update operation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `table_name` (string, required) - Table name (e.g., ZOK_T_TEST_0001). Table must already exist.
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Optional if object is local or already in transport.

---

<a id="validatetablelow-low-level-table"></a>
#### ValidateTableLow (Low-Level / Table)
**Description:** [low-level] Validate an ABAP table name before creation. Checks if the name is valid and available. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/table/low/handleValidateTable.ts`

**Parameters:**
- `description` (string, required) - Table description. Required for validation.
- `package_name` (string, required) - Package name (e.g., ZOK_LOCAL, $TMP for local objects). Required for validation.
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `table_name` (string, required) - Table name to validate (e.g., Z_MY_TABLE)

---

<a id="low-level-transport"></a>
### Low-Level / Transport

<a id="createtransportlow-low-level-transport"></a>
#### CreateTransportLow (Low-Level / Transport)
**Description:** [low-level] Create a new ABAP transport request.

**Source:** `src/handlers/transport/low/handleCreateTransport.ts`

**Parameters:**
- `description` (string, required) - Transport request description.
- `transport_type` (string, optional (default: workbench').)) - Transport type: 'workbench' or 'customizing' (optional, default: 'workbench').

---

<a id="low-level-view"></a>
### Low-Level / View

<a id="activateviewlow-low-level-view"></a>
#### ActivateViewLow (Low-Level / View)
**Description:** Operation: Activate, Create, Update. Subject: View. Will be useful for activating, creating, or updating view. [low-level] Activate an ABAP view (CDS view). Returns activation status and any warnings/errors. Can use session_id and session_state from GetSession to maintain the same session.

**Source:** `src/handlers/view/low/handleActivateView.ts`

**Parameters:**
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `view_name` (string, required) - View name (e.g., ZVW_MY_VIEW).

---

<a id="checkviewlow-low-level-view"></a>
#### CheckViewLow (Low-Level / View)
**Description:** [low-level] Perform syntax check on an ABAP view. Returns syntax errors, warnings, and messages. Can use session_id and session_state from GetSession to maintain the same session. If ddl_source is provided, validates new/unsaved code (will be base64 encoded in request).

**Source:** `src/handlers/view/low/handleCheckView.ts`

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

**Parameters:**
- `transport_request` (string, optional) - Transport request number (e.g., ABCK900001). Required for transportable objects. Optional for local objects ($TMP).
- `view_name` (string, required) - View name (e.g., Z_MY_PROGRAM).

---

<a id="lockviewlow-low-level-view"></a>
#### LockViewLow (Low-Level / View)
**Description:** [low-level] Lock an ABAP view for modification. Returns lock handle that must be used in subsequent update/unlock operations with the same session_id.

**Source:** `src/handlers/view/low/handleLockView.ts`

**Parameters:**
- `session_id` (string, optional) - Session ID from GetSession. If not provided, a new session will be created.
- `session_state` (object, optional) - Session state from GetSession (cookies, csrf_token, cookie_store). Required if session_id is provided.
- `view_name` (string, required) - View name (e.g., Z_MY_PROGRAM).

---

<a id="unlockviewlow-low-level-view"></a>
#### UnlockViewLow (Low-Level / View)
**Description:** [low-level] Unlock an ABAP view after modification. Requires the lock_handle from LockView operation.

**Source:** `src/handlers/view/low/handleUnlockView.ts`

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

**Parameters:**
- `xslt_name` (string, required) - Transformation name.

---

*Last updated: 2026-11-09*
