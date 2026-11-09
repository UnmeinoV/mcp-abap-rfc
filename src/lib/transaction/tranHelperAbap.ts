/**
 * ABAP source of the SE93 transaction helper (function group ZMCP_TRAN) that
 * CreateTransaction / DeleteTransaction call over RFC, installed by
 * SetupTransactionHelper.
 *
 * WHY A Z HELPER (measured 2026-11-05, S4D): ADT has no transaction resource
 * (none of the 672 discovery collections; /vit/wb/object_type/tran is 400, the
 * guessed /transactions URIs 404 — Eclipse itself opens SE93 in SAP GUI), and
 * SAP's own RPY_TRANSACTION_INSERT / _DELETE (function group SEUK) are not
 * RFC-enabled. Read from their source: a REPORT transaction (type 'R') is TSTC
 * (PGMNA, DYPNO 1000, CINFO x'80'), TSTCT (short text in the given language), an
 * optional TSTCP row holding the bare variant name, and RS_CORR_INSERT for
 * TADIR + the transport. 1266 customer report transactions on S4D have exactly
 * CINFO 80; SAP's own variant transactions hold the bare name (SAP&...) in TSTCP.
 *
 * Bump TRAN_HELPER_VERSION on ANY source change (comments included).
 */

/** 1 = CREATE + DELETE. 2 = the "no screen 1000" warning no longer guesses a reason. */
export const TRAN_HELPER_VERSION = '2';
export const TRAN_HELPER_GROUP = 'ZMCP_TRAN';
export const TRAN_HELPER_CREATE = 'Z_MCP_TRAN_CREATE';
export const TRAN_HELPER_DELETE = 'Z_MCP_TRAN_DELETE';

export const TRAN_HELPER_GROUP_DESCRIPTION = 'MCP: SE93 transaction helper';
export const TRAN_HELPER_CREATE_DESCRIPTION =
  'MCP: create a report transaction';
export const TRAN_HELPER_DELETE_DESCRIPTION = 'MCP: delete a transaction';

export const TRAN_HELPER_CREATE_SOURCE = `FUNCTION z_mcp_tran_create
  IMPORTING
    VALUE(iv_tcode) TYPE tcode
    VALUE(iv_program) TYPE progname
    VALUE(iv_text) TYPE ttext_stct
    VALUE(iv_package) TYPE devclass
    VALUE(iv_screen) TYPE sydynnr DEFAULT '1000'
    VALUE(iv_variant) TYPE variant OPTIONAL
    VALUE(iv_request) TYPE trkorr OPTIONAL
    VALUE(iv_language) TYPE spras OPTIONAL
    VALUE(iv_test) TYPE flag DEFAULT space
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_status) TYPE flag
    VALUE(ev_message) TYPE bapi_msg
    VALUE(ev_warning) TYPE bapi_msg
    VALUE(ev_language) TYPE spras.

* Installed by the mcp-abap-adt tool SetupTransactionHelper - do not edit here,
* the tool overwrites this source. Helper version ${TRAN_HELPER_VERSION}.
*
* Creates a REPORT transaction (SE93 "program and selection screen") through
* RPY_TRANSACTION_INSERT, transaction_type 'R'. Every check below runs BEFORE
* anything is written; iv_test = 'X' stops after them.
* ev_status: S = created and read back as requested, F = refused or failed.

  DATA lv_lang TYPE spras.
  DATA lv_tcvariant TYPE tcvariant.
  DATA lv_msg TYPE bapi_msg.

  ev_version = '${TRAN_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_message, ev_warning.
  lv_lang = COND #( WHEN iv_language IS INITIAL THEN sy-langu ELSE iv_language ).
  ev_language = lv_lang.

  IF iv_tcode IS INITIAL OR NOT ( iv_tcode(1) = 'Z' OR iv_tcode(1) = 'Y' OR iv_tcode(1) = '/' ).
    ev_message = |Transaction code { iv_tcode } is not in the customer namespace (Z*, Y* or /namespace/) - refused|.
    RETURN.
  ENDIF.

  SELECT SINGLE tcode FROM tstc WHERE tcode = @iv_tcode INTO @DATA(lv_existing).
  IF sy-subrc = 0.
    ev_message = |Transaction { iv_tcode } already exists|.
    RETURN.
  ENDIF.

  SELECT SINGLE subc FROM trdir WHERE name = @iv_program INTO @DATA(lv_subc).
  IF sy-subrc <> 0.
    ev_message = |Program { iv_program } does not exist|.
    RETURN.
  ENDIF.
  IF lv_subc <> '1'.
    ev_message = |Program { iv_program } is not an executable program (TRDIR-SUBC { lv_subc }); | &&
                 |a report transaction needs one|.
    RETURN.
  ENDIF.

  SELECT SINGLE dnum FROM d020s WHERE prog = @iv_program AND dnum = @iv_screen INTO @DATA(lv_dnum).
  IF sy-subrc <> 0.
    IF iv_screen <> '1000'.
      ev_message = |Program { iv_program } has no screen { iv_screen } - pass an existing selection screen|.
      RETURN.
    ENDIF.
    ev_warning = |D020S has no screen 1000 for { iv_program } (measured: also true of programs that do have a | &&
                 |selection screen); if the program has none, the transaction starts it directly.|.
  ENDIF.

  IF iv_variant IS NOT INITIAL.
    IF iv_variant(4) = 'CUS&' OR iv_variant(4) = 'SAP&'.
      " System variants live in client 000 and are valid in every client.
      SELECT SINGLE variant FROM varid USING CLIENT '000'
        WHERE report = @iv_program AND variant = @iv_variant INTO @DATA(lv_sysvar).
      IF sy-subrc <> 0.
        ev_message = |System variant { iv_variant } of { iv_program } does not exist (client 000)|.
        RETURN.
      ENDIF.
    ELSE.
      SELECT SINGLE variant FROM varid
        WHERE report = @iv_program AND variant = @iv_variant INTO @DATA(lv_var).
      IF sy-subrc <> 0.
        ev_message = |Variant { iv_variant } of { iv_program } does not exist in client { sy-mandt }|.
        RETURN.
      ENDIF.
      ev_warning = |{ ev_warning } Variant { iv_variant } is client-specific: the transaction finds it only | &&
                   |in clients where it exists (system variants CUS&... / SAP&... work in every client).|.
    ENDIF.
  ENDIF.

  SELECT SINGLE devclass FROM tdevc WHERE devclass = @iv_package INTO @DATA(lv_devclass).
  IF sy-subrc <> 0.
    ev_message = |Package { iv_package } does not exist|.
    RETURN.
  ENDIF.

  IF iv_package(1) <> '$'.
    IF iv_request IS INITIAL.
      ev_message = |Package { iv_package } is transportable: a transport request is required|.
      RETURN.
    ENDIF.
    SELECT SINGLE trfunction, trstatus FROM e070 WHERE trkorr = @iv_request
      INTO (@DATA(lv_trfunction), @DATA(lv_trstatus)).
    IF sy-subrc <> 0.
      ev_message = |Transport request { iv_request } does not exist|.
      RETURN.
    ENDIF.
    IF lv_trstatus <> 'D'.
      ev_message = |Transport request { iv_request } is not modifiable (status { lv_trstatus })|.
      RETURN.
    ENDIF.
    IF lv_trfunction <> 'K' AND lv_trfunction <> 'S'.
      ev_message = |Transport request { iv_request } has type { lv_trfunction }; a transaction needs a | &&
                   |workbench request (K) or one of its tasks|.
      RETURN.
    ENDIF.
  ENDIF.

  IF iv_test = 'X'.
    ev_status = 'S'.
    ev_message = 'TEST MODE: every check passed, nothing was created.'.
    RETURN.
  ENDIF.

  lv_tcvariant = iv_variant.
  CALL FUNCTION 'RPY_TRANSACTION_INSERT'
    EXPORTING
      transaction         = iv_tcode
      program             = iv_program
      dynpro              = iv_screen
      language            = lv_lang
      development_class   = iv_package
      transport_number    = iv_request
      transaction_type    = 'R'
      shorttext           = iv_text
      variant             = lv_tcvariant
    EXCEPTIONS
      cancelled           = 1
      already_exist       = 2
      permission_error    = 3
      name_not_allowed    = 4
      name_conflict       = 5
      illegal_type        = 6
      object_inconsistent = 7
      db_access_error     = 8
      OTHERS              = 9.
  IF sy-subrc <> 0.
    DATA(lv_subrc) = sy-subrc.
    IF sy-msgid IS NOT INITIAL.
      MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno
        WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
    ENDIF.
    ROLLBACK WORK.
    ev_message = |RPY_TRANSACTION_INSERT refused (exception { lv_subrc }): { lv_msg }|.
    RETURN.
  ENDIF.

  " A report transaction gets screen 1000 from RPY_TRANSACTION_INSERT; SE93 lets
  " the selection screen be chosen, so another one is set on the new row.
  IF iv_screen <> '1000'.
    UPDATE tstc SET dypno = @iv_screen WHERE tcode = @iv_tcode.
  ENDIF.
  COMMIT WORK.

  " Read back what was stored.
  SELECT SINGLE pgmna, dypno, cinfo FROM tstc WHERE tcode = @iv_tcode
    INTO (@DATA(lv_pgmna), @DATA(lv_dypno), @DATA(lv_cinfo)).
  IF sy-subrc <> 0.
    ev_message = |RPY_TRANSACTION_INSERT returned without error, but TSTC has no row for { iv_tcode }|.
    RETURN.
  ENDIF.
  IF lv_pgmna <> iv_program OR lv_dypno <> iv_screen OR lv_cinfo <> '80'.
    ev_message = |{ iv_tcode } was created but reads back as program { lv_pgmna }, screen { lv_dypno }, | &&
                 |CINFO { lv_cinfo } (expected { iv_program }, { iv_screen }, 80 = report transaction)|.
    RETURN.
  ENDIF.

  ev_status = 'S'.
  ev_message = |Report transaction { iv_tcode } created for { iv_program } (screen { iv_screen }) in { iv_package }|.

ENDFUNCTION.`;

export const TRAN_HELPER_DELETE_SOURCE = `FUNCTION z_mcp_tran_delete
  IMPORTING
    VALUE(iv_tcode) TYPE tcode
    VALUE(iv_request) TYPE trkorr OPTIONAL
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_status) TYPE flag
    VALUE(ev_message) TYPE bapi_msg.

* Installed by the mcp-abap-adt tool SetupTransactionHelper - do not edit here,
* the tool overwrites this source. Helper version ${TRAN_HELPER_VERSION}.
*
* Deletes a CUSTOMER transaction through RPY_TRANSACTION_DELETE (TSTC, TSTCT,
* TSTCP, TSTCA, TSTCC, the authorization defaults, the transport entry).
* SAP-namespace transactions are refused before anything is touched.

  DATA lv_msg TYPE bapi_msg.

  ev_version = '${TRAN_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR ev_message.

  IF iv_tcode IS INITIAL OR NOT ( iv_tcode(1) = 'Z' OR iv_tcode(1) = 'Y' OR iv_tcode(1) = '/' ).
    ev_message = |Transaction code { iv_tcode } is not in the customer namespace - refused|.
    RETURN.
  ENDIF.

  SELECT SINGLE tcode FROM tstc WHERE tcode = @iv_tcode INTO @DATA(lv_existing).
  IF sy-subrc <> 0.
    ev_message = |Transaction { iv_tcode } does not exist|.
    RETURN.
  ENDIF.

  SELECT SINGLE devclass FROM tadir
    WHERE pgmid = 'R3TR' AND object = 'TRAN' AND obj_name = @iv_tcode
    INTO @DATA(lv_devclass).
  IF sy-subrc = 0 AND lv_devclass(1) <> '$' AND iv_request IS INITIAL.
    ev_message = |{ iv_tcode } is in transportable package { lv_devclass }: a transport request is required|.
    RETURN.
  ENDIF.

  CALL FUNCTION 'RPY_TRANSACTION_DELETE'
    EXPORTING
      transaction      = iv_tcode
      transport_number = iv_request
    EXCEPTIONS
      not_excecuted    = 1
      object_not_found = 2
      OTHERS           = 3.
  IF sy-subrc <> 0.
    DATA(lv_subrc) = sy-subrc.
    IF sy-msgid IS NOT INITIAL.
      MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno
        WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
    ENDIF.
    ROLLBACK WORK.
    ev_message = |RPY_TRANSACTION_DELETE refused (exception { lv_subrc }): { lv_msg }|.
    RETURN.
  ENDIF.
  COMMIT WORK.

  SELECT SINGLE tcode FROM tstc WHERE tcode = @iv_tcode INTO @DATA(lv_left).
  IF sy-subrc = 0.
    ev_message = |RPY_TRANSACTION_DELETE returned without error, but TSTC still holds { iv_tcode }|.
    RETURN.
  ENDIF.

  ev_status = 'S'.
  ev_message = |Transaction { iv_tcode } deleted|.

ENDFUNCTION.`;
