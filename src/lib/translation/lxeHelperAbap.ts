/**
 * ABAP source of the SE63 translation helper that GetTranslation /
 * UpdateTranslation call over RFC, installed by SetupTranslationHelper.
 *
 * WHY A Z HELPER AT ALL (measured 2026-11-05, S4D): SE63 saves through
 * LXE_OBJ_TEXT_PAIR_WRITE / reads through LXE_OBJ_TEXT_PAIR_READ, and neither
 * is RFC-enabled (TFDIR-FMODE blank); ADT has no translation resource for
 * DDIC objects (its data-element PUT edits the master language only). So the
 * two SAP modules are wrapped by two RFC-enabled Z modules.
 *
 * Bump LXE_HELPER_VERSION whenever either source changes: the tools compare it
 * with the EV_VERSION the installed helper returns and refuse to run against
 * an outdated one, naming SetupTranslationHelper as the fix.
 */

/**
 * 1 = READ + WRITE. 2 = + RECORD (2026-11-05); READ/WRITE unchanged apart from
 * the version they report, so their RFC signature is the same as in 1.
 * 3 = a RECORD comment corrected (entries land on the request, not a task).
 */
export const LXE_HELPER_VERSION = '3';
export const LXE_HELPER_GROUP = 'ZMCP_LXE';
export const LXE_HELPER_READ = 'Z_MCP_LXE_READ';
export const LXE_HELPER_WRITE = 'Z_MCP_LXE_WRITE';
export const LXE_HELPER_RECORD = 'Z_MCP_LXE_RECORD';
/** SE63's local translation area (cl_lxe_constants=>c_trl_area_local). */
export const LXE_LOCAL_AREA = '999999';

export const LXE_HELPER_GROUP_DESCRIPTION =
  'MCP: SE63 translation read/write (LXE)';
export const LXE_HELPER_READ_DESCRIPTION =
  'MCP: read SE63 text pairs of one object';
export const LXE_HELPER_RECORD_DESCRIPTION =
  'MCP: put SE63 translations on a request (SLXT)';
export const LXE_HELPER_WRITE_DESCRIPTION =
  'MCP: write SE63 translation of one object';

export const LXE_HELPER_READ_SOURCE = `FUNCTION z_mcp_lxe_read
  IMPORTING
    VALUE(iv_objtype) TYPE lxeobjtype
    VALUE(iv_objname) TYPE lxeobjname
    VALUE(iv_target_lang) TYPE lxeisolang
    VALUE(iv_source_lang) TYPE lxeisolang OPTIONAL
    VALUE(iv_custmnr) TYPE lxecustmnr DEFAULT '999999'
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_orig_lang) TYPE lxeisolang
    VALUE(ev_status) TYPE lxestatprc
    VALUE(ev_message) TYPE lxestring
    VALUE(et_texts) TYPE lxe_tt_pcx_s1.

* Installed by the mcp-abap-adt tool SetupTranslationHelper - do not edit here,
* the tool overwrites this source. Helper version ${LXE_HELPER_VERSION}.
*
* Reads the text pairs SE63 shows for one translation object
* (LXE object type + name), e.g. DTEL / DOMA / MESS / TABT.
* Same entry point SE63 uses: LXE_OBJ_TEXT_PAIR_READ.
* Languages are LXE (ISO) codes from table LXE_T002, e.g. zhCN, enUS.
* ev_status: S = read, F = failed (reason in ev_message).

  DATA lt_texts TYPE STANDARD TABLE OF lxe_pcx_s1.
  DATA lv_status TYPE lxestatprc.
  DATA lv_msg TYPE lxestring.

  ev_version = '${LXE_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_orig_lang, ev_message, et_texts.

  CALL FUNCTION 'LXE_OBJ_TEXT_PAIR_READ'
    EXPORTING
      t_lang    = iv_target_lang
      s_lang    = iv_source_lang
      custmnr   = iv_custmnr
      objtype   = iv_objtype
      objname   = iv_objname
      read_only = 'X'
    IMPORTING
      pstatus   = lv_status
      o_lang    = ev_orig_lang
      err_msg   = lv_msg
    TABLES
      lt_pcx_s1 = lt_texts.

  IF ev_orig_lang IS INITIAL.
    ev_message = |{ iv_objtype } { iv_objname }: no original language found - object does not exist, | &&
                 |or the type is not a short-text translation object. { lv_msg }|.
    RETURN.
  ENDIF.

  IF lv_status = 'F'.
    ev_message = |{ iv_objtype } { iv_objname }: LXE_OBJ_TEXT_PAIR_READ failed. { lv_msg }|.
    RETURN.
  ENDIF.

  et_texts = lt_texts.
  ev_status = 'S'.
  ev_message = |{ lines( lt_texts ) } text pair(s); original language { ev_orig_lang }|.

ENDFUNCTION.`;

export const LXE_HELPER_WRITE_SOURCE = `FUNCTION z_mcp_lxe_write
  IMPORTING
    VALUE(iv_objtype) TYPE lxeobjtype
    VALUE(iv_objname) TYPE lxeobjname
    VALUE(iv_target_lang) TYPE lxeisolang
    VALUE(iv_source_lang) TYPE lxeisolang OPTIONAL
    VALUE(iv_custmnr) TYPE lxecustmnr DEFAULT '999999'
    VALUE(it_texts) TYPE lxe_tt_pcx_s1
    VALUE(iv_test) TYPE flag DEFAULT space
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_orig_lang) TYPE lxeisolang
    VALUE(ev_status) TYPE lxestatprc
    VALUE(ev_message) TYPE lxestring
    VALUE(et_before) TYPE lxe_tt_pcx_s1
    VALUE(et_after) TYPE lxe_tt_pcx_s1.

* Installed by the mcp-abap-adt tool SetupTranslationHelper - do not edit here,
* the tool overwrites this source. Helper version ${LXE_HELPER_VERSION}.
*
* Writes a translation of one LXE object the way SE63 saves it:
* LXE_OBJ_TEXT_PAIR_WRITE (which also writes the LXE_LOG row that
* SLXT later turns into a LANG transport). Nothing is transported here.
*
* it_texts: only TEXTKEY and T_TEXT are read. Keys not passed keep their
* current translation (the full pair list is read first and merged,
* because the type writers rewrite the whole object, e.g. DD04T row).
*
* Guards - every one refuses BEFORE anything is written:
*  - S_TRANSLAT ACTVT 02 for the target language (what SE63 checks)
*  - target language = original language -> refused. The LXE writer does
*    NOT check this; for DTEL it would overwrite the master DD04T row.
*  - unknown or ambiguous text key, text longer than the field allows,
*    lower case on an upper-case-only field.
* After writing, the object is read back and every passed key compared;
* ev_status = 'S' only when the read-back shows every requested text.

  TYPES ty_pairs TYPE STANDARD TABLE OF lxe_pcx_s1 WITH DEFAULT KEY.
  DATA lt_pairs TYPE ty_pairs.
  DATA lt_after TYPE ty_pairs.
  DATA lv_status TYPE lxestatprc.
  DATA lv_msg TYPE lxestring.
  DATA lv_t_r3 TYPE spras.
  DATA lv_o_r3 TYPE spras.
  DATA lv_s_lang TYPE lxeisolang.
  DATA lv_hits TYPE i.
  DATA lv_keys TYPE string.

  ev_version = '${LXE_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_orig_lang, ev_message, et_before, et_after.

  IF it_texts IS INITIAL.
    ev_message = 'IT_TEXTS is empty - nothing to write'.
    RETURN.
  ENDIF.

  CALL FUNCTION 'LXE_SE63_CHECK_AUTHORIZATION'
    EXPORTING
      target_lang      = iv_target_lang
    EXCEPTIONS
      not_authorized   = 1
      invalid_language = 2
      OTHERS           = 3.
  CASE sy-subrc.
    WHEN 0.
    WHEN 1.
      ev_message = |No authorization S_TRANSLAT (ACTVT 02) for target language { iv_target_lang }|.
      RETURN.
    WHEN OTHERS.
      ev_message = |Target language { iv_target_lang } is not an LXE language (table LXE_T002, e.g. zhCN, enUS)|.
      RETURN.
  ENDCASE.

  CALL FUNCTION 'LXE_OBJ_TEXT_PAIR_READ'
    EXPORTING
      t_lang    = iv_target_lang
      s_lang    = iv_source_lang
      custmnr   = iv_custmnr
      objtype   = iv_objtype
      objname   = iv_objname
      read_only = 'X'
    IMPORTING
      pstatus   = lv_status
      o_lang    = ev_orig_lang
      err_msg   = lv_msg
    TABLES
      lt_pcx_s1 = lt_pairs.
  IF ev_orig_lang IS INITIAL OR lv_status = 'F'.
    ev_message = |{ iv_objtype } { iv_objname }: could not be read (does it exist? is the type a short-text object?). { lv_msg }|.
    RETURN.
  ENDIF.
  et_before = lt_pairs.

  CALL FUNCTION 'LXE_T002_CHECK_LANGUAGE'
    EXPORTING
      language  = iv_target_lang
    IMPORTING
      o_r3_lang = lv_t_r3
    EXCEPTIONS
      OTHERS    = 1.
  CALL FUNCTION 'LXE_T002_CHECK_LANGUAGE'
    EXPORTING
      language  = ev_orig_lang
    IMPORTING
      o_r3_lang = lv_o_r3
    EXCEPTIONS
      OTHERS    = 1.
  IF lv_t_r3 IS INITIAL OR lv_t_r3 = lv_o_r3.
    ev_message = |Refused: target language { iv_target_lang } is the ORIGINAL language ({ ev_orig_lang }) of | &&
                 |{ iv_objtype } { iv_objname }. That is an edit of the object itself, not a translation.|.
    RETURN.
  ENDIF.

  lv_s_lang = iv_source_lang.
  IF lv_s_lang IS INITIAL.
    lv_s_lang = ev_orig_lang.
  ENDIF.

  LOOP AT lt_pairs INTO DATA(ls_known).
    lv_keys = COND #( WHEN lv_keys IS INITIAL THEN |{ ls_known-textkey }| ELSE |{ lv_keys }, { ls_known-textkey }| ).
  ENDLOOP.

  LOOP AT it_texts INTO DATA(ls_in).
    lv_hits = 0.
    LOOP AT lt_pairs TRANSPORTING NO FIELDS WHERE textkey = ls_in-textkey.
      lv_hits = lv_hits + 1.
    ENDLOOP.
    IF lv_hits = 0.
      ev_message = |Text key "{ ls_in-textkey }" does not exist for { iv_objtype } { iv_objname }. Known keys: { lv_keys }|.
      RETURN.
    ELSEIF lv_hits > 1.
      ev_message = |Text key "{ ls_in-textkey }" is not unique for { iv_objtype } { iv_objname } ({ lv_hits } pairs) - refused|.
      RETURN.
    ENDIF.
    READ TABLE lt_pairs ASSIGNING FIELD-SYMBOL(<ls_pair>) WITH KEY textkey = ls_in-textkey.
    IF <ls_pair>-unitmlt > 0 AND strlen( ls_in-t_text ) > <ls_pair>-unitmlt.
      ev_message = |Text for key "{ ls_in-textkey }" has { strlen( ls_in-t_text ) } characters; the field allows { <ls_pair>-unitmlt }|.
      RETURN.
    ENDIF.
    IF <ls_pair>-uppcase = 'X' AND ls_in-t_text <> to_upper( ls_in-t_text ).
      ev_message = |Text for key "{ ls_in-textkey }" must be upper case (the field is upper-case only)|.
      RETURN.
    ENDIF.
    <ls_pair>-t_text = ls_in-t_text.
  ENDLOOP.

  IF iv_test = 'X'.
    et_after = lt_pairs.
    ev_status = 'S'.
    ev_message = |TEST MODE: all guards passed, nothing written. ET_AFTER is what would be written.|.
    RETURN.
  ENDIF.

  CLEAR lv_msg.
  CALL FUNCTION 'LXE_OBJ_TEXT_PAIR_WRITE'
    EXPORTING
      t_lang    = iv_target_lang
      s_lang    = lv_s_lang
      custmnr   = iv_custmnr
      objtype   = iv_objtype
      objname   = iv_objname
    IMPORTING
      pstatus   = lv_status
      err_msg   = lv_msg
    TABLES
      lt_pcx_s1 = lt_pairs.
  IF lv_status <> 'S'.
    ev_message = |LXE_OBJ_TEXT_PAIR_WRITE returned status "{ lv_status }". { lv_msg } | &&
                 |(LXE_LOG ERROR means the texts were written but the transport log row was not.)|.
  ENDIF.

  CALL FUNCTION 'LXE_OBJ_TEXT_PAIR_READ'
    EXPORTING
      t_lang    = iv_target_lang
      s_lang    = lv_s_lang
      custmnr   = iv_custmnr
      objtype   = iv_objtype
      objname   = iv_objname
      read_only = 'X'
    IMPORTING
      pstatus   = lv_status
    TABLES
      lt_pcx_s1 = lt_after.
  et_after = lt_after.

  LOOP AT it_texts INTO ls_in.
    READ TABLE lt_after INTO DATA(ls_after) WITH KEY textkey = ls_in-textkey.
    IF sy-subrc <> 0 OR ls_after-t_text <> ls_in-t_text.
      ev_status = 'F'.
      ev_message = |{ ev_message }Read-back does not show the requested text for key "{ ls_in-textkey }" - | &&
                   |NOT verified as written.|.
      RETURN.
    ENDIF.
  ENDLOOP.

  IF ev_message IS INITIAL.
    ev_status = 'S'.
    ev_message = |{ lines( it_texts ) } text(s) written to { iv_target_lang } and verified by read-back; | &&
                 |logged in LXE_LOG (area { iv_custmnr }) - not in any transport request.|.
  ENDIF.

ENDFUNCTION.`;

export const LXE_HELPER_RECORD_SOURCE = `FUNCTION z_mcp_lxe_record
  IMPORTING
    VALUE(iv_target_lang) TYPE lxeisolang
    VALUE(iv_request) TYPE trkorr
    VALUE(it_objects) TYPE lxe_tt_lxe_log
    VALUE(iv_custmnr) TYPE lxecustmnr DEFAULT '999999'
    VALUE(iv_test) TYPE flag DEFAULT space
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_status) TYPE lxestatprc
    VALUE(ev_message) TYPE lxestring
    VALUE(et_entries) TYPE tr_objects
    VALUE(et_errors) TYPE lxe_tt_log_error.

* Installed by the mcp-abap-adt tool SetupTranslationHelper - do not edit here,
* the tool overwrites this source. Helper version ${LXE_HELPER_VERSION}.
*
* Puts translations on a transport request the way SLXT does it
* (CL_LXE_LOG_EXPORT_LOCAL->write_to_request_local, force = space):
* for each LXE_LOG row of the object in the target language,
* LXE_OBJ_CREATE_TRANSPORT_ENTRY builds the LANG E071/E071K entries,
* TR_REQ_CHECK_KEY checks the table keys and TR_REQUEST_CHOICE (dialog
* suppressed) appends them to the request.
*
* it_objects: only OBJTYPE and OBJNAME are read.
* ev_status: S = every object recorded and found on the request afterwards,
* W = some objects failed (see et_errors), F = nothing recorded.
* et_errors-err_type, as in SLXT: B entry could not be built, C invalid table
* key, D/E TR_REQUEST_CHOICE refused (text in TRKEY); added here:
* N object has no LXE_LOG row in this language (never saved as a translation),
* V written but NOT found on the request (task) afterwards.
* et_entries: the E071 rows read back from the request and its tasks
* (in test mode: the rows that would be written).

  DATA lt_log TYPE STANDARD TABLE OF lxe_log.
  DATA lt_e071 TYPE tr_objects.
  DATA lt_e071k TYPE tr_keys.
  DATA lt_all TYPE tr_objects.
  DATA ls_err TYPE lxe_tt_log_error_line.
  DATA ls_header TYPE trwbo_request_header.
  DATA lv_pstatus TYPE lxestatprc.
  DATA lv_r3 TYPE spras.
  DATA lv_trfunction TYPE trfunction.
  DATA lv_trstatus TYPE trstatus.
  DATA lv_strkorr TYPE strkorr.
  DATA lv_bad TYPE abap_bool.
  DATA lv_text TYPE string.
  DATA lt_langs TYPE RANGE OF lxeisolang.
  DATA lt_korr TYPE RANGE OF trkorr.
  DATA lv_objects_ok TYPE i.

  ev_version = '${LXE_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_message, et_entries, et_errors.

  IF it_objects IS INITIAL.
    ev_message = 'IT_OBJECTS is empty - nothing to record'.
    RETURN.
  ENDIF.

  CALL FUNCTION 'LXE_T002_CHECK_LANGUAGE'
    EXPORTING
      language  = iv_target_lang
    IMPORTING
      o_r3_lang = lv_r3
    EXCEPTIONS
      OTHERS    = 1.
  IF sy-subrc <> 0 OR lv_r3 IS INITIAL.
    ev_message = |Target language { iv_target_lang } is not an LXE language (table LXE_T002, e.g. zhCN, enUS)|.
    RETURN.
  ENDIF.

  SELECT SINGLE trfunction, trstatus, strkorr FROM e070
    WHERE trkorr = @iv_request
    INTO (@lv_trfunction, @lv_trstatus, @lv_strkorr).
  IF sy-subrc <> 0.
    ev_message = |Transport request { iv_request } does not exist|.
    RETURN.
  ENDIF.
  IF lv_strkorr IS NOT INITIAL.
    ev_message = |{ iv_request } is a task of request { lv_strkorr } - pass the request|.
    RETURN.
  ENDIF.
  IF lv_trstatus <> 'D'.
    ev_message = |Request { iv_request } is not modifiable (status { lv_trstatus })|.
    RETURN.
  ENDIF.
  IF lv_trfunction <> 'K' AND lv_trfunction <> 'T'.
    ev_message = |Request { iv_request } has type { lv_trfunction }; language entries go into a workbench (K) | &&
                 |or transport-of-copies (T) request, as in SLXT|.
    RETURN.
  ENDIF.

  " LXE_LOG keys the language as LXE code: zhCN and zh++ are both SAP '1'.
  SELECT language FROM lxe_t002 WHERE r3_lang = @lv_r3 INTO TABLE @DATA(lt_t002).
  LOOP AT lt_t002 INTO DATA(ls_t002).
    APPEND VALUE #( sign = 'I' option = 'EQ' low = ls_t002-language ) TO lt_langs.
  ENDLOOP.

  ls_header-trkorr     = iv_request.
  ls_header-trfunction = 'K'.
  ls_header-client     = sy-mandt.
  ls_header-as4user    = sy-uname.

  LOOP AT it_objects INTO DATA(ls_obj).
    CLEAR ls_err.
    ls_err-objtype  = ls_obj-objtype.
    ls_err-objname  = ls_obj-objname.
    ls_err-language = lv_r3.

    SELECT * FROM lxe_log
      WHERE custmnr = @iv_custmnr
        AND targlng IN @lt_langs
        AND objtype = @ls_obj-objtype
        AND objname = @ls_obj-objname
      INTO TABLE @lt_log.
    IF lt_log IS INITIAL.
      ls_err-err_type = 'N'.
      APPEND ls_err TO et_errors.
      CONTINUE.
    ENDIF.
    SORT lt_log BY tabkey.
    DELETE ADJACENT DUPLICATES FROM lt_log COMPARING tabkey.

    lv_bad = abap_false.
    LOOP AT lt_log INTO DATA(ls_log).
      CLEAR: lt_e071, lt_e071k, lv_pstatus.
      CALL FUNCTION 'LXE_OBJ_CREATE_TRANSPORT_ENTRY'
        EXPORTING
          language = iv_target_lang
          custmnr  = iv_custmnr
          objtype  = ls_log-objtype
          objname  = ls_log-objname
          tabkey   = ls_log-tabkey
        IMPORTING
          pstatus  = lv_pstatus
        TABLES
          ex_e071  = lt_e071
          ex_e071k = lt_e071k.
      IF lv_pstatus <> 'S' OR lt_e071 IS INITIAL.
        ls_err-tabkey   = ls_log-tabkey.
        ls_err-err_type = 'B'.
        APPEND ls_err TO et_errors.
        lv_bad = abap_true.
        CONTINUE.
      ENDIF.

      " SLXT: an entry that is not a language object is turned into one.
      LOOP AT lt_e071 ASSIGNING FIELD-SYMBOL(<ls_e071>) WHERE pgmid <> 'LANG'.
        LOOP AT lt_e071k ASSIGNING FIELD-SYMBOL(<ls_e071k>)
             WHERE mastertype = <ls_e071>-object AND mastername = <ls_e071>-obj_name.
          <ls_e071k>-pgmid = 'LANG'.
          <ls_e071k>-lang  = lv_r3.
        ENDLOOP.
        <ls_e071>-pgmid = 'LANG'.
        <ls_e071>-lang  = lv_r3.
      ENDLOOP.

      LOOP AT lt_e071k INTO DATA(ls_key).
        CALL FUNCTION 'TR_REQ_CHECK_KEY'
          EXPORTING
            is_key            = ls_key
            is_request_header = ls_header
          EXCEPTIONS
            OTHERS            = 1.
        IF sy-subrc <> 0.
          ls_err-tabkey   = ls_log-tabkey.
          ls_err-pgmid    = ls_key-pgmid.
          ls_err-trtype   = ls_key-mastertype.
          ls_err-trname   = ls_key-mastername.
          ls_err-trkey    = ls_key-tabkey.
          ls_err-err_type = 'C'.
          APPEND ls_err TO et_errors.
          lv_bad = abap_true.
          EXIT.
        ENDIF.
      ENDLOOP.
      IF lv_bad = abap_true.
        CONTINUE.
      ENDIF.

      IF iv_test = 'X'.
        APPEND LINES OF lt_e071 TO lt_all.
        CONTINUE.
      ENDIF.

      CALL FUNCTION 'TR_REQUEST_CHOICE'
        EXPORTING
          iv_suppress_dialog   = 'X'
          iv_request_types     = 'TK'
          iv_request           = iv_request
          it_e071              = lt_e071
          it_e071k             = lt_e071k
          iv_with_error_log    = 'X'
          iv_no_owner_check    = 'X'
        EXCEPTIONS
          invalid_request      = 1
          invalid_request_type = 2
          user_not_owner       = 3
          no_objects_appended  = 4
          enqueue_error        = 5
          cancelled_by_user    = 6
          recursive_call       = 7
          OTHERS               = 8.
      IF sy-subrc <> 0.
        lv_text = |TR_REQUEST_CHOICE sy-subrc { sy-subrc }|.
        IF sy-msgid IS NOT INITIAL.
          MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno
            WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO DATA(lv_msgtext).
          lv_text = |{ lv_text }: { lv_msgtext }|.
        ENDIF.
        ls_err-tabkey   = ls_log-tabkey.
        ls_err-trkey    = lv_text.
        ls_err-err_type = COND #( WHEN sy-subrc = 4 THEN 'D' ELSE 'E' ).
        APPEND ls_err TO et_errors.
        lv_bad = abap_true.
        CONTINUE.
      ENDIF.
      APPEND LINES OF lt_e071 TO lt_all.
    ENDLOOP.

    IF lv_bad = abap_false.
      lv_objects_ok = lv_objects_ok + 1.
    ENDIF.
  ENDLOOP.

  SORT lt_all BY pgmid object obj_name lang.
  DELETE ADJACENT DUPLICATES FROM lt_all COMPARING pgmid object obj_name lang.

  IF iv_test = 'X'.
    et_entries = lt_all.
  ELSE.
    COMMIT WORK.
    " Verify on the request AND its tasks (measured: LANG entries land on the request itself).
    SELECT trkorr FROM e070 WHERE trkorr = @iv_request OR strkorr = @iv_request
      INTO TABLE @DATA(lt_e070).
    LOOP AT lt_e070 INTO DATA(ls_e070).
      APPEND VALUE #( sign = 'I' option = 'EQ' low = ls_e070-trkorr ) TO lt_korr.
    ENDLOOP.
    LOOP AT lt_all INTO DATA(ls_want).
      SELECT * FROM e071
        WHERE trkorr IN @lt_korr
          AND pgmid = @ls_want-pgmid
          AND object = @ls_want-object
          AND obj_name = @ls_want-obj_name
          AND lang = @ls_want-lang
        INTO @DATA(ls_have) UP TO 1 ROWS.
      ENDSELECT.
      IF sy-subrc = 0.
        APPEND ls_have TO et_entries.
      ELSE.
        CLEAR ls_err.
        ls_err-pgmid    = ls_want-pgmid.
        ls_err-trtype   = ls_want-object.
        ls_err-trname   = ls_want-obj_name.
        ls_err-language = ls_want-lang.
        ls_err-err_type = 'V'.
        APPEND ls_err TO et_errors.
      ENDIF.
    ENDLOOP.
  ENDIF.

  IF et_errors IS INITIAL AND lt_all IS NOT INITIAL.
    ev_status = 'S'.
  ELSEIF lt_all IS NOT INITIAL.
    ev_status = 'W'.
  ENDIF.
  ev_message = |{ lv_objects_ok } of { lines( it_objects ) } object(s) | &&
               COND string( WHEN iv_test = 'X' THEN |would be recorded (test mode, nothing written)|
                            ELSE |recorded on { iv_request }| ) &&
               |, { lines( lt_all ) } LANG entr(ies), { lines( et_errors ) } error(s)|.

ENDFUNCTION.`;
