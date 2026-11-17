/**
 * ABAP source of the GUI status helper (function group ZMCP_CUA) that
 * AddGuiStatusButton calls over RFC, installed by SetupGuiStatusHelper.
 *
 * WHY A Z HELPER (measured 2026-11-13, S4D/100): ADT has no GUI-status
 * resource (no CUA / menu / function-key collection among the discovery
 * document's collections; Eclipse opens SE41 in SAP GUI). READING needs no
 * helper — RS_CUA_INTERNAL_FETCH is RFC-enabled (TFDIR-FMODE R). WRITING does:
 * RS_CUA_INTERNAL_WRITE is not RFC-enabled, and it only stores the tables — no
 * authority check, no lock, no transport entry, no COMMIT.
 *
 * The sequence below is SE41's own save path, read from its source (function
 * group SMPE, LSMPEF00 save_cua_internal / LSMPEF07 copy_status_diff_progs_new):
 *   RS_ACCESS_PERMISSION MODIFY object_class 'SCUA'  (authority + enqueue)
 *   RS_CUA_INTERNAL_FETCH                           (the whole interface)
 *   RS_CORR_INSERT object_class 'SCUA' MODIFY       (transport entry)
 *   write state: inactive when the working area is active
 *                (RS_CUA_INTERNAL_GET_WRIT_STATE = RS_WORKING_AREA_ACTIVE_CHECK)
 *   RS_CUA_INTERNAL_WRITE
 *   RS_ACCESS_PERMISSION FREE
 * plus, for an inactive write, RS_WORKING_OBJECTS_ACTIVATE on the CUAD entry.
 *
 * A button is four rows (all measured on a customer status whose buttons had
 * been added in SE41): FUN = the function code (text, icon), PFK = the function
 * key it is bound to IN THE STATUS'S KEY SET, BUT = its slot on the
 * application toolbar (slot 01..35, SAP's con_max_pbut_entries), SET = the
 * function is active in the status. Key sets are referenced BY CODE from
 * RSMPE_STAT, so two statuses may share one — refused, see below.
 *
 * Bump CUA_HELPER_VERSION on ANY source change (comments included).
 */

/**
 * 1 = ADD_BUTTON. 2 = EV_MESSAGE / EV_WARNING are strings (a long status list
 * was cut at 220). 3 = COPY_STATUS added. 4 = DELETE_STATUS, REMOVE_BUTTON added.
 */
export const CUA_HELPER_VERSION = '4';
export const CUA_HELPER_GROUP = 'ZMCP_CUA';
export const CUA_HELPER_ADD_BUTTON = 'Z_MCP_CUA_ADD_BUTTON';
export const CUA_HELPER_COPY_STATUS = 'Z_MCP_CUA_COPY_STATUS';
export const CUA_HELPER_DELETE_STATUS = 'Z_MCP_CUA_DELETE_STATUS';
export const CUA_HELPER_REMOVE_BUTTON = 'Z_MCP_CUA_REMOVE_BUTTON';

export const CUA_HELPER_GROUP_DESCRIPTION = 'MCP: SE41 GUI status helper';
export const CUA_HELPER_ADD_BUTTON_DESCRIPTION =
  'MCP: add a toolbar button to a GUI status';
export const CUA_HELPER_COPY_STATUS_DESCRIPTION =
  'MCP: copy a GUI status between programs (SE41 copy)';
export const CUA_HELPER_DELETE_STATUS_DESCRIPTION =
  'MCP: delete a GUI status (SE41)';
export const CUA_HELPER_REMOVE_BUTTON_DESCRIPTION =
  'MCP: remove a button from a GUI status toolbar';

/**
 * Function keys tried, in order, when no key is given: Shift-F1..Shift-F12
 * (13..24) without Shift-F3 (15, Exit by convention), then Ctrl-F1..F12 and
 * Ctrl-Shift-F1..F12 (25..48). F1..F12 carry fixed meanings (help, back,
 * F4, cancel, …) and are only used when the caller names one of F5..F9.
 */
export const AUTO_FUNCTION_KEYS: readonly string[] = [
  13,
  14,
  ...Array.from({ length: 48 - 16 + 1 }, (_, i) => 16 + i),
].map((n) => String(n).padStart(2, '0'));

/** Keys a caller may name explicitly. */
export const ALLOWED_FUNCTION_KEYS: readonly string[] = [
  5,
  6,
  7,
  8,
  9,
  ...Array.from({ length: 48 - 13 + 1 }, (_, i) => 13 + i),
].map((n) => String(n).padStart(2, '0'));

/** The auto keys as VALUE rows, 10 per line (ABAP lines stop at 255 characters). */
function autoKeyLines(): string {
  const rows = AUTO_FUNCTION_KEYS.map((k) => `( '${k}' )`);
  const lines: string[] = [];
  for (let i = 0; i < rows.length; i += 10) {
    lines.push(`        ${rows.slice(i, i + 10).join(' ')}`);
  }
  return lines.join('\n');
}

export const CUA_HELPER_ADD_BUTTON_SOURCE = `FUNCTION z_mcp_cua_add_button
  IMPORTING
    VALUE(iv_program) TYPE progname
    VALUE(iv_status) TYPE gui_status
    VALUE(iv_function) TYPE gui_func
    VALUE(iv_text) TYPE gui_text
    VALUE(iv_icon) TYPE iconname OPTIONAL
    VALUE(iv_icon_text) TYPE gui_ictext OPTIONAL
    VALUE(iv_info_text) TYPE gui_info OPTIONAL
    VALUE(iv_fkey) TYPE cua_pfno OPTIONAL
    VALUE(iv_request) TYPE trkorr OPTIONAL
    VALUE(iv_test) TYPE flag DEFAULT space
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_status) TYPE flag
    VALUE(ev_written) TYPE flag
    VALUE(ev_message) TYPE string
    VALUE(ev_warning) TYPE string
    VALUE(ev_language) TYPE spras
    VALUE(ev_fkey) TYPE cua_pfno
    VALUE(ev_position) TYPE cua_butno
    VALUE(ev_write_state) TYPE char1
    VALUE(ev_korrnum) TYPE trkorr.

* Installed by the mcp-abap-adt tool SetupGuiStatusHelper - do not edit here,
* the tool overwrites this source. Helper version ${CUA_HELPER_VERSION}.
*
* Adds ONE new function code as a button on the application toolbar of ONE
* existing GUI status of a customer program, the way SE41 saves (see the TS
* file this source ships in). Every refusal runs BEFORE RS_CORR_INSERT /
* RS_CUA_INTERNAL_WRITE; iv_test = 'X' stops after them.
* ev_status: S = written and read back as requested, F = refused or failed.
* ev_written: X = RS_CUA_INTERNAL_WRITE ran and was committed.

  DATA lt_sta TYPE STANDARD TABLE OF rsmpe_stat.
  DATA lt_fun TYPE STANDARD TABLE OF rsmpe_funt.
  DATA lt_men TYPE STANDARD TABLE OF rsmpe_men.
  DATA lt_mtx TYPE STANDARD TABLE OF rsmpe_mnlt.
  DATA lt_act TYPE STANDARD TABLE OF rsmpe_act.
  DATA lt_but TYPE STANDARD TABLE OF rsmpe_but.
  DATA lt_pfk TYPE STANDARD TABLE OF rsmpe_pfk.
  DATA lt_set TYPE STANDARD TABLE OF rsmpe_staf.
  DATA lt_doc TYPE STANDARD TABLE OF rsmpe_atrt.
  DATA lt_tit TYPE STANDARD TABLE OF rsmpe_titt.
  DATA lt_biv TYPE STANDARD TABLE OF rsmpe_buts.
  DATA ls_adm TYPE rsmpe_adm.
  DATA ls_trkey TYPE trkey.
  DATA ls_sta TYPE rsmpe_stat.
  DATA lt_objects TYPE STANDARD TABLE OF dwinactiv.
  DATA lt_keys TYPE STANDARD TABLE OF cua_pfno WITH EMPTY KEY.
  DATA lv_icon_id TYPE icon_d.
  DATA lv_extend TYPE c LENGTH 1.
  DATA lv_state TYPE c LENGTH 1.
  DATA lv_msg TYPE bapi_msg.
  DATA lv_sym TYPE string.
  DATA lv_no TYPE i.
  DATA lv_max TYPE i.
  DATA lv_count TYPE i.
  DATA lv_shared TYPE string.
  DATA lv_known TYPE string.
  DATA lv_locked TYPE abap_bool.
  DATA lv_func TYPE string.

  ev_version = '${CUA_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_written, ev_message, ev_warning, ev_fkey, ev_position, ev_write_state, ev_korrnum.

  IF iv_program IS INITIAL OR NOT ( iv_program(1) = 'Z' OR iv_program(1) = 'Y' OR iv_program(1) = '/' ).
    ev_message = |Program { iv_program } is not in the customer namespace (Z*, Y* or /namespace/) - refused|.
    RETURN.
  ENDIF.

  lv_func = iv_function.
  IF lv_func IS INITIAL OR lv_func CA \` \` OR lv_func <> to_upper( lv_func ).
    ev_message = |Function code "{ lv_func }" must be upper case without blanks|.
    RETURN.
  ENDIF.
  IF iv_text IS INITIAL.
    ev_message = 'The button needs a function text'.
    RETURN.
  ENDIF.

  SELECT SINGLE subc FROM trdir WHERE name = @iv_program INTO @DATA(lv_subc).
  IF sy-subrc <> 0.
    ev_message = |Program { iv_program } does not exist|.
    RETURN.
  ENDIF.
  IF lv_subc <> '1' AND lv_subc <> 'M'.
    ev_message = |Program { iv_program } has TRDIR-SUBC { lv_subc }: only executable programs (1) and | &&
                 |module pools (M) have their own GUI statuses here|.
    RETURN.
  ENDIF.

  SELECT SINGLE devclass, masterlang FROM tadir
    WHERE pgmid = 'R3TR' AND object = 'PROG' AND obj_name = @iv_program
    INTO (@DATA(lv_devclass), @DATA(lv_masterlang)).
  IF sy-subrc <> 0 OR lv_masterlang IS INITIAL.
    ev_message = |Program { iv_program } has no TADIR entry with an original language|.
    RETURN.
  ENDIF.
  ev_language = lv_masterlang.

  IF lv_devclass(1) <> '$'.
    IF iv_request IS INITIAL.
      ev_message = |Program { iv_program } is in transportable package { lv_devclass }: a transport request is required|.
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
      ev_message = |Transport request { iv_request } has type { lv_trfunction }; a GUI status needs a | &&
                   |workbench request (K) or one of its tasks|.
      RETURN.
    ENDIF.
  ENDIF.

  " A pending inactive interface would be activated along with this change, or overwritten by it.
  SELECT SINGLE uname FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_program INTO @DATA(lv_inact_user).
  IF sy-subrc = 0.
    ev_message = |The GUI interface of { iv_program } has a pending INACTIVE version (user { lv_inact_user }) - | &&
                 |activate or discard it in SE41 first|.
    RETURN.
  ENDIF.

  IF iv_icon IS NOT INITIAL.
    SELECT SINGLE id FROM icon WHERE name = @iv_icon INTO @lv_icon_id.
    IF sy-subrc <> 0.
      ev_message = |Icon { iv_icon } does not exist (table ICON)|.
      RETURN.
    ENDIF.
  ENDIF.

  IF iv_fkey IS NOT INITIAL AND ( iv_fkey CN '0123456789' OR NOT ( iv_fkey BETWEEN '05' AND '09' OR iv_fkey BETWEEN '13' AND '48' ) ).
    ev_message = |Function key { iv_fkey } cannot carry a toolbar button here: use 05-09 or 13-48|.
    RETURN.
  ENDIF.

  " ---- authority + enqueue, as SE41 does --------------------------------------
  lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
  CALL FUNCTION 'RS_ACCESS_PERMISSION'
    EXPORTING
      authority_check          = 'X'
      mode                     = 'MODIFY'
      object                   = iv_program
      object_class             = 'SCUA'
      suppress_corr_check      = 'X'
      suppress_language_check  = 'X'
      suppress_language_dialog = 'X'
      suppress_extend_dialog   = 'X'
    IMPORTING
      transport_key            = ls_trkey
      extend                   = lv_extend
    EXCEPTIONS
      canceled_in_corr         = 1
      enqueued_by_user         = 2
      enqueue_system_failure   = 3
      illegal_parameter_values = 4
      locked_by_author         = 5
      no_modify_permission     = 6
      no_show_permission       = 7
      permission_failure       = 8
      request_language_denied  = 9
      OTHERS                   = 10.
  IF sy-subrc <> 0.
    DATA(lv_perm_rc) = sy-subrc.
    IF sy-msgid IS NOT INITIAL AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
      MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
    ENDIF.
    ev_message = COND #( WHEN lv_msg IS NOT INITIAL THEN |RS_ACCESS_PERMISSION refused: { lv_msg }|
                         ELSE |RS_ACCESS_PERMISSION returned { lv_perm_rc } without a message| ).
    RETURN.
  ENDIF.
  lv_locked = abap_true.

  DO 1 TIMES.
    IF lv_extend = 'X'.
      ev_message = |{ iv_program } would be changed as a MODIFICATION (not an original of this system) - refused|.
      EXIT.
    ENDIF.
    IF ls_trkey-obj_type IS INITIAL.
      ls_trkey-devclass = lv_devclass.
      ls_trkey-obj_type = 'PROG'.
      ls_trkey-obj_name = iv_program.
    ENDIF.
    IF ls_trkey-sub_type IS INITIAL.
      ls_trkey-sub_type = 'CUAD'.
      ls_trkey-sub_name = iv_program.
    ENDIF.

    CALL FUNCTION 'RS_CUA_INTERNAL_FETCH'
      EXPORTING
        program         = iv_program
        language        = lv_masterlang
        state           = 'A'
      IMPORTING
        adm             = ls_adm
      TABLES
        sta             = lt_sta
        fun             = lt_fun
        men             = lt_men
        mtx             = lt_mtx
        act             = lt_act
        but             = lt_but
        pfk             = lt_pfk
        set             = lt_set
        doc             = lt_doc
        tit             = lt_tit
        biv             = lt_biv
      EXCEPTIONS
        not_found       = 1
        unknown_version = 2
        OTHERS          = 3.
    IF sy-subrc <> 0.
      ev_message = |{ iv_program } has no GUI interface (RS_CUA_INTERNAL_FETCH { sy-subrc }) - create the status in SE41 first|.
      EXIT.
    ENDIF.

    READ TABLE lt_sta INTO ls_sta WITH KEY code = iv_status.
    IF sy-subrc <> 0.
      LOOP AT lt_sta INTO DATA(ls_any).
        lv_known = |{ lv_known } { ls_any-code }|.
      ENDLOOP.
      ev_message = |Status { iv_status } does not exist in { iv_program } (statuses:{ lv_known })|.
      EXIT.
    ENDIF.
    IF ls_sta-modal = 'C'.
      ev_message = |Status { iv_status } is a context menu: it has no application toolbar|.
      EXIT.
    ENDIF.
    IF ls_sta-pfkcode IS INITIAL OR ls_sta-butcode IS INITIAL.
      ev_message = |Status { iv_status } has no function key set / application toolbar of its own|.
      EXIT.
    ENDIF.

    " Key sets and toolbars are referenced by code: a shared one would change other statuses too.
    LOOP AT lt_sta INTO DATA(ls_other) WHERE code <> iv_status AND pfkcode = ls_sta-pfkcode.
      lv_shared = |{ lv_shared } { ls_other-code }|.
    ENDLOOP.
    IF lv_shared IS NOT INITIAL.
      ev_message = |Status { iv_status } shares its function key set { ls_sta-pfkcode } with status(es){ lv_shared }: | &&
                   |a new key and button would change them too - refused (copy it to a new status first: CopyGuiStatus)|.
      EXIT.
    ENDIF.

    READ TABLE lt_fun TRANSPORTING NO FIELDS WITH KEY code = iv_function.
    IF sy-subrc = 0.
      ev_message = |Function code { iv_function } already exists in the interface of { iv_program } - | &&
                   |this tool adds a NEW function code|.
      EXIT.
    ENDIF.

    IF iv_fkey IS NOT INITIAL.
      READ TABLE lt_pfk INTO DATA(ls_taken) WITH KEY code = ls_sta-pfkcode pfno = iv_fkey.
      IF sy-subrc = 0.
        ev_message = |Function key { iv_fkey } is already assigned to { ls_taken-funcode } in status { iv_status }|.
        EXIT.
      ENDIF.
      ev_fkey = iv_fkey.
    ELSE.
      lt_keys = VALUE #(
${autoKeyLines()} ).
      LOOP AT lt_keys INTO DATA(lv_key).
        READ TABLE lt_pfk TRANSPORTING NO FIELDS WITH KEY code = ls_sta-pfkcode pfno = lv_key.
        IF sy-subrc <> 0.
          ev_fkey = lv_key.
          EXIT.
        ENDIF.
      ENDLOOP.
      IF ev_fkey IS INITIAL.
        ev_message = |Status { iv_status } has no free function key among 13-48 (Shift/Ctrl F-keys)|.
        EXIT.
      ENDIF.
    ENDIF.

    LOOP AT lt_but INTO DATA(ls_but) WHERE pfk_code = ls_sta-pfkcode AND code = ls_sta-butcode.
      lv_count = lv_count + 1.
      lv_no = ls_but-no.
      IF lv_no > lv_max. lv_max = lv_no. ENDIF.
    ENDLOOP.
    lv_no = lv_max + 1.
    IF lv_no > 35.
      ev_message = |The application toolbar of status { iv_status } has no slot after { lv_max } (SAP allows 35)|.
      EXIT.
    ENDIF.
    ev_position = |{ lv_no WIDTH = 2 ALIGN = RIGHT PAD = '0' }|.

    IF iv_test = 'X'.
      ev_status = 'S'.
      ev_message = |TEST MODE: every check passed, nothing was written (key { ev_fkey }, slot { ev_position })|.
      EXIT.
    ENDIF.

    APPEND VALUE rsmpe_funt( code = iv_function textno = '001' text_type = 'S' text_name = iv_icon
                             icon_id = lv_icon_id fun_text = iv_text icon_text = iv_icon_text
                             info_text = iv_info_text ) TO lt_fun.
    APPEND VALUE rsmpe_pfk( code = ls_sta-pfkcode pfno = ev_fkey funcode = iv_function funno = '001' ) TO lt_pfk.
    APPEND VALUE rsmpe_but( pfk_code = ls_sta-pfkcode code = ls_sta-butcode no = ev_position pfno = ev_fkey ) TO lt_but.
    APPEND VALUE rsmpe_staf( status = iv_status function = iv_function ) TO lt_set.
    SORT: lt_fun, lt_pfk, lt_but, lt_set.

    " ---- transport entry ---------------------------------------------------------
    lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
    CALL FUNCTION 'RS_CORR_INSERT'
      EXPORTING
        object              = iv_program
        object_class        = 'SCUA'
        mode                = 'MODIFY'
        devclass            = lv_devclass
        korrnum             = iv_request
        master_language     = lv_masterlang
        suppress_dialog     = 'X'
      IMPORTING
        korrnum             = ev_korrnum
      EXCEPTIONS
        cancelled           = 1
        permission_failure  = 2
        unknown_objectclass = 3
        OTHERS              = 4.
    IF sy-subrc <> 0.
      DATA(lv_corr_rc) = sy-subrc.
      IF sy-msgid IS NOT INITIAL AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      ROLLBACK WORK.
      ev_message = COND #( WHEN lv_msg IS NOT INITIAL THEN |RS_CORR_INSERT refused: { lv_msg }|
                           ELSE |RS_CORR_INSERT returned { lv_corr_rc } without a message| ).
      EXIT.
    ENDIF.

    " ---- write: inactive when the working area is active (= RS_CUA_INTERNAL_GET_WRIT_STATE)
    CALL FUNCTION 'RS_WORKING_AREA_ACTIVE_CHECK'
      EXCEPTIONS
        nok    = 1
        OTHERS = 2.
    lv_state = COND #( WHEN sy-subrc = 0 THEN 'I' ELSE 'A' ).
    ev_write_state = lv_state.

    lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
    CALL FUNCTION 'RS_CUA_INTERNAL_WRITE'
      EXPORTING
        program      = iv_program
        language     = lv_masterlang
        tr_key       = ls_trkey
        adm          = ls_adm
        state        = lv_state
      TABLES
        sta          = lt_sta
        fun          = lt_fun
        men          = lt_men
        mtx          = lt_mtx
        act          = lt_act
        but          = lt_but
        pfk          = lt_pfk
        set          = lt_set
        doc          = lt_doc
        tit          = lt_tit
        biv          = lt_biv
      EXCEPTIONS
        not_found    = 1
        invalid_data = 2
        OTHERS       = 3.
    IF sy-subrc <> 0.
      DATA(lv_write_rc) = sy-subrc.
      IF sy-msgid IS NOT INITIAL AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      ROLLBACK WORK.
      ev_message = COND #( WHEN lv_msg IS NOT INITIAL THEN |RS_CUA_INTERNAL_WRITE refused: { lv_msg }|
                           ELSE |RS_CUA_INTERNAL_WRITE returned { lv_write_rc } without a message| ).
      EXIT.
    ENDIF.
    COMMIT WORK AND WAIT.
    ev_written = 'X'.

    IF lv_state = 'I'.
      SELECT * FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_program AND uname = @sy-uname
        INTO TABLE @lt_objects.
      IF lt_objects IS INITIAL.
        ev_message = |Written as an inactive version, but DWINACTIV has no CUAD entry for { iv_program } to activate|.
        EXIT.
      ENDIF.
      lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
      CALL FUNCTION 'RS_WORKING_OBJECTS_ACTIVATE'
        EXPORTING
          activate_ddic_objects  = space
          with_popup             = space
          suppress_corr_insert   = 'X'
          ui_decoupled           = abap_true
        TABLES
          objects                = lt_objects
        EXCEPTIONS
          excecution_error       = 1
          cancelled              = 2
          insert_into_corr_error = 3
          OTHERS                 = 4.
      DATA(lv_act_rc) = sy-subrc.
      IF lv_act_rc <> 0 AND sy-msgid IS NOT INITIAL
         AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      COMMIT WORK AND WAIT.
      SELECT SINGLE uname FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_program INTO @lv_inact_user.
      IF sy-subrc = 0.
        ev_message = |Written, but NOT activated (RS_WORKING_OBJECTS_ACTIVATE { lv_act_rc } { lv_msg }); | &&
                     |the change is the inactive version of { iv_program } - activate it in SE41|.
        EXIT.
      ENDIF.
    ENDIF.

    " ---- read back the ACTIVE interface ---------------------------------------------
    CLEAR: lt_sta, lt_fun, lt_men, lt_mtx, lt_act, lt_but, lt_pfk, lt_set, lt_doc, lt_tit, lt_biv.
    CALL FUNCTION 'RS_CUA_INTERNAL_FETCH'
      EXPORTING
        program         = iv_program
        language        = lv_masterlang
        state           = 'A'
      TABLES
        sta             = lt_sta
        fun             = lt_fun
        men             = lt_men
        mtx             = lt_mtx
        act             = lt_act
        but             = lt_but
        pfk             = lt_pfk
        set             = lt_set
        doc             = lt_doc
        tit             = lt_tit
        biv             = lt_biv
      EXCEPTIONS
        OTHERS          = 1.
    IF sy-subrc <> 0.
      ev_message = |Written, but the active interface of { iv_program } could not be read back|.
      EXIT.
    ENDIF.
    READ TABLE lt_fun INTO DATA(ls_fun_back) WITH KEY code = iv_function.
    READ TABLE lt_pfk TRANSPORTING NO FIELDS WITH KEY code = ls_sta-pfkcode pfno = ev_fkey funcode = iv_function.
    DATA(lv_pfk_ok) = COND string( WHEN sy-subrc = 0 THEN 'found' ELSE 'MISSING' ).
    READ TABLE lt_but TRANSPORTING NO FIELDS WITH KEY pfk_code = ls_sta-pfkcode code = ls_sta-butcode no = ev_position pfno = ev_fkey.
    DATA(lv_but_ok) = COND string( WHEN sy-subrc = 0 THEN 'found' ELSE 'MISSING' ).
    READ TABLE lt_set TRANSPORTING NO FIELDS WITH KEY status = iv_status function = iv_function.
    DATA(lv_set_ok) = COND string( WHEN sy-subrc = 0 THEN 'found' ELSE 'MISSING' ).
    IF ls_fun_back-fun_text <> iv_text OR lv_pfk_ok <> 'found' OR lv_but_ok <> 'found' OR lv_set_ok <> 'found'.
      ev_message = |Written, but the active interface reads back differently: text "{ ls_fun_back-fun_text }", | &&
                   |key { lv_pfk_ok }, button { lv_but_ok }, status entry { lv_set_ok }|.
      EXIT.
    ENDIF.

    ev_status = 'S'.
    ev_message = |Button { iv_function } added to status { iv_status } of { iv_program } (key { ev_fkey }, slot { ev_position })|.
  ENDDO.

  IF lv_locked = abap_true.
    CALL FUNCTION 'RS_ACCESS_PERMISSION'
      EXPORTING
        mode         = 'FREE'
        object       = iv_program
        object_class = 'SCUA'
      EXCEPTIONS
        OTHERS       = 1.
  ENDIF.

ENDFUNCTION.`;

/**
 * Copy ONE GUI status from any program into a customer program under a new
 * name — SE41's own "copy status", RS_CUA_COPY_STA with suppress_dialog
 * (function group SMPE, read from its source, LSMPEF07
 * copy_status_diff_progs_new / LSMPEF30 check_program_status):
 *   check_program_status: source program + status exist, target program
 *     exists with SUBC 1/M/F, target status does NOT exist, name check,
 *     RS_ACCESS_PERMISSION MODIFY SCUA on the target (never freed there),
 *     copy language = TADIR-MASTERLANG of the target;
 *   fetch target (a target WITHOUT a GUI interface is allowed) and source,
 *     both in that language;
 *   merge: the copy gets its OWN new key set, toolbar and menu bar (numbered
 *     after the target's ADM counters), menus renumbered; a function code the
 *     target already has with other attributes gets an additional text number
 *     — the target's existing texts are not overwritten;
 *   RS_CORR_INSERT SCUA MODIFY WITHOUT suppress_dialog -> RS_CUA_INTERNAL_WRITE.
 * It neither commits, nor activates, nor frees the lock. This wrapper adds the
 * checks up front (so iv_test can stop before anything is written), records
 * the transport entry first with suppress_dialog (so SAP's own RS_CORR_INSERT
 * finds the object already recorded and needs no dialog), commits, activates
 * an inactive write, frees the lock and reads the result back.
 */
export const CUA_HELPER_COPY_STATUS_SOURCE = `FUNCTION z_mcp_cua_copy_status
  IMPORTING
    VALUE(iv_source_program) TYPE progname
    VALUE(iv_source_status) TYPE gui_status
    VALUE(iv_target_program) TYPE progname
    VALUE(iv_target_status) TYPE gui_status
    VALUE(iv_request) TYPE trkorr OPTIONAL
    VALUE(iv_test) TYPE flag DEFAULT space
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_status) TYPE flag
    VALUE(ev_written) TYPE flag
    VALUE(ev_message) TYPE string
    VALUE(ev_warning) TYPE string
    VALUE(ev_language) TYPE spras
    VALUE(ev_new_interface) TYPE flag
    VALUE(ev_write_state) TYPE char1
    VALUE(ev_korrnum) TYPE trkorr.

* Installed by the mcp-abap-adt tool SetupGuiStatusHelper - do not edit here,
* the tool overwrites this source. Helper version ${CUA_HELPER_VERSION}.
*
* Copies ONE GUI status into a customer program under a new name with SE41's
* own RS_CUA_COPY_STA (see the TS file this source ships in). Every refusal
* runs BEFORE RS_CORR_INSERT / RS_CUA_COPY_STA; iv_test = 'X' stops after them.
* ev_status: S = written and read back, F = refused or failed.
* ev_written: X = RS_CUA_COPY_STA ran and was committed.

  TYPES: BEGIN OF ty_iface,
           sta TYPE STANDARD TABLE OF rsmpe_stat WITH DEFAULT KEY,
           fun TYPE STANDARD TABLE OF rsmpe_funt WITH DEFAULT KEY,
           men TYPE STANDARD TABLE OF rsmpe_men WITH DEFAULT KEY,
           mtx TYPE STANDARD TABLE OF rsmpe_mnlt WITH DEFAULT KEY,
           act TYPE STANDARD TABLE OF rsmpe_act WITH DEFAULT KEY,
           but TYPE STANDARD TABLE OF rsmpe_but WITH DEFAULT KEY,
           pfk TYPE STANDARD TABLE OF rsmpe_pfk WITH DEFAULT KEY,
           set TYPE STANDARD TABLE OF rsmpe_staf WITH DEFAULT KEY,
           doc TYPE STANDARD TABLE OF rsmpe_atrt WITH DEFAULT KEY,
           tit TYPE STANDARD TABLE OF rsmpe_titt WITH DEFAULT KEY,
           biv TYPE STANDARD TABLE OF rsmpe_buts WITH DEFAULT KEY,
         END OF ty_iface.
  DATA ls_src TYPE ty_iface.
  DATA ls_tgt TYPE ty_iface.
  DATA ls_sta TYPE rsmpe_stat.
  DATA ls_new TYPE rsmpe_stat.
  DATA lt_objects TYPE STANDARD TABLE OF dwinactiv.
  DATA lv_msg TYPE bapi_msg.
  DATA lv_sym TYPE string.
  DATA lv_known TYPE string.
  DATA lv_name TYPE string.
  DATA lv_rc TYPE i.
  DATA lv_locked TYPE abap_bool.
  DATA lv_untexted TYPE i.
  DATA lv_src_keys TYPE i.
  DATA lv_src_buts TYPE i.
  DATA lv_src_set TYPE i.
  DATA lv_tgt_keys TYPE i.
  DATA lv_tgt_buts TYPE i.
  DATA lv_tgt_set TYPE i.

  ev_version = '${CUA_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_written, ev_message, ev_warning, ev_new_interface, ev_write_state, ev_korrnum.

  IF iv_target_program IS INITIAL OR NOT ( iv_target_program(1) = 'Z' OR iv_target_program(1) = 'Y' OR iv_target_program(1) = '/' ).
    ev_message = |Target program { iv_target_program } is not in the customer namespace (Z*, Y* or /namespace/) - refused|.
    RETURN.
  ENDIF.
  lv_name = iv_target_status.
  IF lv_name IS INITIAL OR lv_name CA \` \` OR lv_name <> to_upper( lv_name ).
    ev_message = |Target status "{ lv_name }" must be upper case without blanks|.
    RETURN.
  ENDIF.
  IF iv_source_program = iv_target_program AND iv_source_status = iv_target_status.
    ev_message = 'Source and target are the same status'.
    RETURN.
  ENDIF.
  CALL FUNCTION 'RS_CUA_INTERNAL_NAME_CHECK'
    EXPORTING
      name      = iv_target_status
      name_type = 'C'
    EXCEPTIONS
      OTHERS    = 1.
  IF sy-subrc <> 0.
    MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
    ev_message = |Target status name { iv_target_status } is not allowed: { lv_msg }|.
    RETURN.
  ENDIF.

  SELECT SINGLE subc FROM trdir WHERE name = @iv_source_program INTO @DATA(lv_src_subc).
  IF sy-subrc <> 0.
    ev_message = |Source program { iv_source_program } does not exist|.
    RETURN.
  ENDIF.
  SELECT SINGLE subc FROM trdir WHERE name = @iv_target_program INTO @DATA(lv_subc).
  IF sy-subrc <> 0.
    ev_message = |Target program { iv_target_program } does not exist|.
    RETURN.
  ENDIF.
  IF lv_subc <> '1' AND lv_subc <> 'M'.
    ev_message = |Target program { iv_target_program } has TRDIR-SUBC { lv_subc }: only executable programs (1) and | &&
                 |module pools (M) are supported|.
    RETURN.
  ENDIF.

  SELECT SINGLE devclass, masterlang FROM tadir
    WHERE pgmid = 'R3TR' AND object = 'PROG' AND obj_name = @iv_target_program
    INTO (@DATA(lv_devclass), @DATA(lv_masterlang)).
  IF sy-subrc <> 0 OR lv_masterlang IS INITIAL.
    ev_message = |Target program { iv_target_program } has no TADIR entry with an original language|.
    RETURN.
  ENDIF.
  ev_language = lv_masterlang.

  IF lv_devclass(1) <> '$'.
    IF iv_request IS INITIAL.
      ev_message = |Target program { iv_target_program } is in transportable package { lv_devclass }: a transport request is required|.
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
      ev_message = |Transport request { iv_request } has type { lv_trfunction }; a GUI status needs a | &&
                   |workbench request (K) or one of its tasks|.
      RETURN.
    ENDIF.
  ENDIF.

  SELECT SINGLE uname FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_target_program INTO @DATA(lv_inact_user).
  IF sy-subrc = 0.
    ev_message = |The GUI interface of { iv_target_program } has a pending INACTIVE version (user { lv_inact_user }) - | &&
                 |activate or discard it in SE41 first|.
    RETURN.
  ENDIF.

  " ---- source and target as SAP will see them (texts in the target's original language)
  CALL FUNCTION 'RS_CUA_INTERNAL_FETCH'
    EXPORTING
      program         = iv_source_program
      language        = lv_masterlang
      state           = 'A'
    TABLES
      sta             = ls_src-sta
      fun             = ls_src-fun
      men             = ls_src-men
      mtx             = ls_src-mtx
      act             = ls_src-act
      but             = ls_src-but
      pfk             = ls_src-pfk
      set             = ls_src-set
      doc             = ls_src-doc
      tit             = ls_src-tit
      biv             = ls_src-biv
    EXCEPTIONS
      not_found       = 1
      unknown_version = 2
      OTHERS          = 3.
  IF sy-subrc <> 0.
    ev_message = |Source program { iv_source_program } has no GUI interface (RS_CUA_INTERNAL_FETCH { sy-subrc })|.
    RETURN.
  ENDIF.
  READ TABLE ls_src-sta INTO ls_sta WITH KEY code = iv_source_status.
  IF sy-subrc <> 0.
    LOOP AT ls_src-sta INTO DATA(ls_any).
      lv_known = |{ lv_known } { ls_any-code }|.
    ENDLOOP.
    ev_message = |Status { iv_source_status } does not exist in { iv_source_program } (statuses:{ lv_known })|.
    RETURN.
  ENDIF.

  CALL FUNCTION 'RS_CUA_INTERNAL_FETCH'
    EXPORTING
      program         = iv_target_program
      language        = lv_masterlang
      state           = 'A'
    TABLES
      sta             = ls_tgt-sta
      fun             = ls_tgt-fun
      men             = ls_tgt-men
      mtx             = ls_tgt-mtx
      act             = ls_tgt-act
      but             = ls_tgt-but
      pfk             = ls_tgt-pfk
      set             = ls_tgt-set
      doc             = ls_tgt-doc
      tit             = ls_tgt-tit
      biv             = ls_tgt-biv
    EXCEPTIONS
      not_found       = 1
      unknown_version = 2
      OTHERS          = 3.
  lv_rc = sy-subrc.
  IF lv_rc = 1.
    ev_new_interface = 'X'.
  ELSEIF lv_rc <> 0.
    ev_message = |The GUI interface of { iv_target_program } cannot be read (RS_CUA_INTERNAL_FETCH { lv_rc })|.
    RETURN.
  ENDIF.
  READ TABLE ls_tgt-sta TRANSPORTING NO FIELDS WITH KEY code = iv_target_status.
  IF sy-subrc = 0.
    ev_message = |Status { iv_target_status } already exists in { iv_target_program } - choose another name|.
    RETURN.
  ENDIF.

  " What the copy will carry, counted on the source.
  LOOP AT ls_src-pfk INTO DATA(ls_spfk) WHERE code = ls_sta-pfkcode.
    lv_src_keys = lv_src_keys + 1.
    READ TABLE ls_src-fun INTO DATA(ls_sfun) WITH KEY code = ls_spfk-funcode textno = ls_spfk-funno.
    IF sy-subrc <> 0 OR ls_sfun-fun_text IS INITIAL.
      lv_untexted = lv_untexted + 1.
    ENDIF.
  ENDLOOP.
  LOOP AT ls_src-but TRANSPORTING NO FIELDS WHERE pfk_code = ls_sta-pfkcode AND code = ls_sta-butcode.
    lv_src_buts = lv_src_buts + 1.
  ENDLOOP.
  LOOP AT ls_src-set TRANSPORTING NO FIELDS WHERE status = iv_source_status.
    lv_src_set = lv_src_set + 1.
  ENDLOOP.
  IF lv_untexted > 0.
    ev_warning = |{ lv_untexted } of the { lv_src_keys } function keys of { iv_source_program } { iv_source_status } have | &&
                 |no text in language { lv_masterlang } (the original language of { iv_target_program }); they are copied without text|.
  ENDIF.

  IF iv_test = 'X'.
    ev_status = 'S'.
    ev_message = |TEST MODE: every check passed, nothing was written (status { iv_source_status } of { iv_source_program }: | &&
                 |{ lv_src_keys } function keys, { lv_src_buts } toolbar entries, { lv_src_set } active functions)|.
    RETURN.
  ENDIF.

  " ---- transport entry first, without a dialog (SAP's own RS_CORR_INSERT in the copy has none)
  lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
  CALL FUNCTION 'RS_CORR_INSERT'
    EXPORTING
      object              = iv_target_program
      object_class        = 'SCUA'
      mode                = 'MODIFY'
      devclass            = lv_devclass
      korrnum             = iv_request
      master_language     = lv_masterlang
      suppress_dialog     = 'X'
    IMPORTING
      korrnum             = ev_korrnum
    EXCEPTIONS
      cancelled           = 1
      permission_failure  = 2
      unknown_objectclass = 3
      OTHERS              = 4.
  IF sy-subrc <> 0.
    lv_rc = sy-subrc.
    IF sy-msgid IS NOT INITIAL AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
      MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
    ENDIF.
    ROLLBACK WORK.
    ev_message = COND #( WHEN lv_msg IS NOT INITIAL THEN |RS_CORR_INSERT refused: { lv_msg }|
                         ELSE |RS_CORR_INSERT returned { lv_rc } without a message| ).
    RETURN.
  ENDIF.

  " ---- SE41's copy. It takes the SCUA lock on the target and does not release it.
  lv_locked = abap_true.
  lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
  CALL FUNCTION 'RS_CUA_COPY_STA'
    EXPORTING
      im_program              = iv_source_program
      im_status               = iv_source_status
      im_tprogram             = iv_target_program
      im_tstatus              = iv_target_status
      suppress_dialog         = 'X'
      generate                = space
    EXCEPTIONS
      not_executed            = 1
      insufficient_parameters = 2
      unknown_version         = 3
      s_program_not_found     = 4
      t_program_not_found     = 5
      s_status_not_found      = 6
      t_status_found          = 7
      wrong_program_type      = 8
      invalid_status_name     = 9
      permission_failure      = 10
      generation_failure      = 11
      error_message           = 12
      OTHERS                  = 13.
  lv_rc = sy-subrc.

  DO 1 TIMES.
    IF lv_rc <> 0.
      IF sy-msgid IS NOT INITIAL AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      ROLLBACK WORK.
      ev_message = COND #( WHEN lv_msg IS NOT INITIAL THEN |RS_CUA_COPY_STA failed ({ lv_rc }): { lv_msg }|
                           ELSE |RS_CUA_COPY_STA returned { lv_rc } without a message| ).
      EXIT.
    ENDIF.
    COMMIT WORK AND WAIT.
    ev_written = 'X'.

    SELECT * FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_target_program AND uname = @sy-uname
      INTO TABLE @lt_objects.
    ev_write_state = COND #( WHEN lt_objects IS INITIAL THEN 'A' ELSE 'I' ).
    IF lt_objects IS NOT INITIAL.
      lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
      CALL FUNCTION 'RS_WORKING_OBJECTS_ACTIVATE'
        EXPORTING
          activate_ddic_objects  = space
          with_popup             = space
          suppress_corr_insert   = 'X'
          ui_decoupled           = abap_true
        TABLES
          objects                = lt_objects
        EXCEPTIONS
          excecution_error       = 1
          cancelled              = 2
          insert_into_corr_error = 3
          OTHERS                 = 4.
      lv_rc = sy-subrc.
      IF lv_rc <> 0 AND sy-msgid IS NOT INITIAL
         AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      COMMIT WORK AND WAIT.
      SELECT SINGLE uname FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_target_program INTO @lv_inact_user.
      IF sy-subrc = 0.
        ev_message = |Copied, but NOT activated (RS_WORKING_OBJECTS_ACTIVATE { lv_rc } { lv_msg }); | &&
                     |the copy is the inactive version of { iv_target_program } - activate it in SE41|.
        EXIT.
      ENDIF.
    ENDIF.

    " ---- read back the ACTIVE target and compare with the source -------------------------
    CLEAR ls_tgt.
    CALL FUNCTION 'RS_CUA_INTERNAL_FETCH'
      EXPORTING
        program         = iv_target_program
        language        = lv_masterlang
        state           = 'A'
      TABLES
        sta             = ls_tgt-sta
        fun             = ls_tgt-fun
        men             = ls_tgt-men
        mtx             = ls_tgt-mtx
        act             = ls_tgt-act
        but             = ls_tgt-but
        pfk             = ls_tgt-pfk
        set             = ls_tgt-set
        doc             = ls_tgt-doc
        tit             = ls_tgt-tit
        biv             = ls_tgt-biv
      EXCEPTIONS
        OTHERS          = 1.
    IF sy-subrc <> 0.
      ev_message = |Copied, but the active interface of { iv_target_program } could not be read back|.
      EXIT.
    ENDIF.
    READ TABLE ls_tgt-sta INTO ls_new WITH KEY code = iv_target_status.
    IF sy-subrc <> 0.
      ev_message = |Copied, but status { iv_target_status } is not in the active interface of { iv_target_program }|.
      EXIT.
    ENDIF.
    LOOP AT ls_tgt-pfk TRANSPORTING NO FIELDS WHERE code = ls_new-pfkcode.
      lv_tgt_keys = lv_tgt_keys + 1.
    ENDLOOP.
    LOOP AT ls_tgt-but TRANSPORTING NO FIELDS WHERE pfk_code = ls_new-pfkcode AND code = ls_new-butcode.
      lv_tgt_buts = lv_tgt_buts + 1.
    ENDLOOP.
    LOOP AT ls_tgt-set TRANSPORTING NO FIELDS WHERE status = iv_target_status.
      lv_tgt_set = lv_tgt_set + 1.
    ENDLOOP.
    IF ls_new-modal <> ls_sta-modal OR lv_tgt_keys <> lv_src_keys OR lv_tgt_buts <> lv_src_buts OR lv_tgt_set <> lv_src_set.
      ev_message = |Copied, but the active status reads back differently: type { ls_new-modal }/{ ls_sta-modal }, | &&
                   |keys { lv_tgt_keys }/{ lv_src_keys }, toolbar { lv_tgt_buts }/{ lv_src_buts }, active { lv_tgt_set }/{ lv_src_set } (target/source)|.
      EXIT.
    ENDIF.

    ev_status = 'S'.
    ev_message = |Status { iv_source_status } of { iv_source_program } copied to { iv_target_program } as { iv_target_status } | &&
                 |({ lv_tgt_keys } function keys, { lv_tgt_buts } toolbar entries, { lv_tgt_set } active functions)|.
  ENDDO.

  IF lv_locked = abap_true.
    CALL FUNCTION 'RS_ACCESS_PERMISSION'
      EXPORTING
        mode         = 'FREE'
        object       = iv_target_program
        object_class = 'SCUA'
      EXCEPTIONS
        OTHERS       = 1.
  ENDIF.

ENDFUNCTION.`;

// ---------------------------------------------------------------------------
// Shared fragments of the modules that edit ONE interface in place (delete a
// status, remove a button). Same steps as Z_MCP_CUA_ADD_BUTTON above, whose
// validated source is kept as it is.
// ---------------------------------------------------------------------------

const EDIT_DECLARATIONS = `  DATA lt_sta TYPE STANDARD TABLE OF rsmpe_stat.
  DATA lt_fun TYPE STANDARD TABLE OF rsmpe_funt.
  DATA lt_men TYPE STANDARD TABLE OF rsmpe_men.
  DATA lt_mtx TYPE STANDARD TABLE OF rsmpe_mnlt.
  DATA lt_act TYPE STANDARD TABLE OF rsmpe_act.
  DATA lt_but TYPE STANDARD TABLE OF rsmpe_but.
  DATA lt_pfk TYPE STANDARD TABLE OF rsmpe_pfk.
  DATA lt_set TYPE STANDARD TABLE OF rsmpe_staf.
  DATA lt_doc TYPE STANDARD TABLE OF rsmpe_atrt.
  DATA lt_tit TYPE STANDARD TABLE OF rsmpe_titt.
  DATA lt_biv TYPE STANDARD TABLE OF rsmpe_buts.
  DATA ls_adm TYPE rsmpe_adm.
  DATA ls_trkey TYPE trkey.
  DATA ls_sta TYPE rsmpe_stat.
  DATA lt_objects TYPE STANDARD TABLE OF dwinactiv.
  DATA lv_extend TYPE c LENGTH 1.
  DATA lv_state TYPE c LENGTH 1.
  DATA lv_msg TYPE bapi_msg.
  DATA lv_sym TYPE string.
  DATA lv_rc TYPE i.
  DATA lv_known TYPE string.
  DATA lv_shared TYPE string.
  DATA lv_locked TYPE abap_bool.`;

/** Program, transport and inactive-version checks, then SE41's lock. Refusals RETURN. */
const EDIT_PRELUDE = `  IF iv_program IS INITIAL OR NOT ( iv_program(1) = 'Z' OR iv_program(1) = 'Y' OR iv_program(1) = '/' ).
    ev_message = |Program { iv_program } is not in the customer namespace (Z*, Y* or /namespace/) - refused|.
    RETURN.
  ENDIF.

  SELECT SINGLE subc FROM trdir WHERE name = @iv_program INTO @DATA(lv_subc).
  IF sy-subrc <> 0.
    ev_message = |Program { iv_program } does not exist|.
    RETURN.
  ENDIF.
  IF lv_subc <> '1' AND lv_subc <> 'M'.
    ev_message = |Program { iv_program } has TRDIR-SUBC { lv_subc }: only executable programs (1) and | &&
                 |module pools (M) are supported|.
    RETURN.
  ENDIF.

  SELECT SINGLE devclass, masterlang FROM tadir
    WHERE pgmid = 'R3TR' AND object = 'PROG' AND obj_name = @iv_program
    INTO (@DATA(lv_devclass), @DATA(lv_masterlang)).
  IF sy-subrc <> 0 OR lv_masterlang IS INITIAL.
    ev_message = |Program { iv_program } has no TADIR entry with an original language|.
    RETURN.
  ENDIF.
  ev_language = lv_masterlang.

  IF lv_devclass(1) <> '$'.
    IF iv_request IS INITIAL.
      ev_message = |Program { iv_program } is in transportable package { lv_devclass }: a transport request is required|.
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
      ev_message = |Transport request { iv_request } has type { lv_trfunction }; a GUI status needs a | &&
                   |workbench request (K) or one of its tasks|.
      RETURN.
    ENDIF.
  ENDIF.

  SELECT SINGLE uname FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_program INTO @DATA(lv_inact_user).
  IF sy-subrc = 0.
    ev_message = |The GUI interface of { iv_program } has a pending INACTIVE version (user { lv_inact_user }) - | &&
                 |activate or discard it in SE41 first|.
    RETURN.
  ENDIF.

  lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
  CALL FUNCTION 'RS_ACCESS_PERMISSION'
    EXPORTING
      authority_check          = 'X'
      mode                     = 'MODIFY'
      object                   = iv_program
      object_class             = 'SCUA'
      suppress_corr_check      = 'X'
      suppress_language_check  = 'X'
      suppress_language_dialog = 'X'
      suppress_extend_dialog   = 'X'
    IMPORTING
      transport_key            = ls_trkey
      extend                   = lv_extend
    EXCEPTIONS
      OTHERS                   = 1.
  IF sy-subrc <> 0.
    IF sy-msgid IS NOT INITIAL AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
      MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
    ENDIF.
    ev_message = COND #( WHEN lv_msg IS NOT INITIAL THEN |RS_ACCESS_PERMISSION refused: { lv_msg }|
                         ELSE |RS_ACCESS_PERMISSION refused without a message| ).
    RETURN.
  ENDIF.
  lv_locked = abap_true.`;

/** Inside DO 1 TIMES: modification refusal, transport key, fetch, the status row. */
const EDIT_FETCH = `    IF lv_extend = 'X'.
      ev_message = |{ iv_program } would be changed as a MODIFICATION (not an original of this system) - refused|.
      EXIT.
    ENDIF.
    IF ls_trkey-obj_type IS INITIAL.
      ls_trkey-devclass = lv_devclass.
      ls_trkey-obj_type = 'PROG'.
      ls_trkey-obj_name = iv_program.
    ENDIF.
    IF ls_trkey-sub_type IS INITIAL.
      ls_trkey-sub_type = 'CUAD'.
      ls_trkey-sub_name = iv_program.
    ENDIF.

    CALL FUNCTION 'RS_CUA_INTERNAL_FETCH'
      EXPORTING
        program         = iv_program
        language        = lv_masterlang
        state           = 'A'
      IMPORTING
        adm             = ls_adm
      TABLES
        sta             = lt_sta
        fun             = lt_fun
        men             = lt_men
        mtx             = lt_mtx
        act             = lt_act
        but             = lt_but
        pfk             = lt_pfk
        set             = lt_set
        doc             = lt_doc
        tit             = lt_tit
        biv             = lt_biv
      EXCEPTIONS
        OTHERS          = 1.
    IF sy-subrc <> 0.
      ev_message = |{ iv_program } has no GUI interface|.
      EXIT.
    ENDIF.

    READ TABLE lt_sta INTO ls_sta WITH KEY code = iv_status.
    IF sy-subrc <> 0.
      LOOP AT lt_sta INTO DATA(ls_any).
        lv_known = |{ lv_known } { ls_any-code }|.
      ENDLOOP.
      ev_message = |Status { iv_status } does not exist in { iv_program } (statuses:{ lv_known })|.
      EXIT.
    ENDIF.`;

/** Inside DO 1 TIMES, after the tables were changed: transport entry, write, commit, activate. */
const EDIT_SAVE = `    lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
    CALL FUNCTION 'RS_CORR_INSERT'
      EXPORTING
        object              = iv_program
        object_class        = 'SCUA'
        mode                = 'MODIFY'
        devclass            = lv_devclass
        korrnum             = iv_request
        master_language     = lv_masterlang
        suppress_dialog     = 'X'
      IMPORTING
        korrnum             = ev_korrnum
      EXCEPTIONS
        OTHERS              = 1.
    IF sy-subrc <> 0.
      IF sy-msgid IS NOT INITIAL AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      ROLLBACK WORK.
      ev_message = COND #( WHEN lv_msg IS NOT INITIAL THEN |RS_CORR_INSERT refused: { lv_msg }|
                           ELSE |RS_CORR_INSERT refused without a message| ).
      EXIT.
    ENDIF.

    CALL FUNCTION 'RS_WORKING_AREA_ACTIVE_CHECK'
      EXCEPTIONS
        nok    = 1
        OTHERS = 2.
    lv_state = COND #( WHEN sy-subrc = 0 THEN 'I' ELSE 'A' ).
    ev_write_state = lv_state.

    lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
    CALL FUNCTION 'RS_CUA_INTERNAL_WRITE'
      EXPORTING
        program      = iv_program
        language     = lv_masterlang
        tr_key       = ls_trkey
        adm          = ls_adm
        state        = lv_state
      TABLES
        sta          = lt_sta
        fun          = lt_fun
        men          = lt_men
        mtx          = lt_mtx
        act          = lt_act
        but          = lt_but
        pfk          = lt_pfk
        set          = lt_set
        doc          = lt_doc
        tit          = lt_tit
        biv          = lt_biv
      EXCEPTIONS
        OTHERS       = 1.
    IF sy-subrc <> 0.
      IF sy-msgid IS NOT INITIAL AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      ROLLBACK WORK.
      ev_message = COND #( WHEN lv_msg IS NOT INITIAL THEN |RS_CUA_INTERNAL_WRITE refused: { lv_msg }|
                           ELSE |RS_CUA_INTERNAL_WRITE refused without a message| ).
      EXIT.
    ENDIF.
    COMMIT WORK AND WAIT.
    ev_written = 'X'.

    IF lv_state = 'I'.
      SELECT * FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_program AND uname = @sy-uname
        INTO TABLE @lt_objects.
      IF lt_objects IS INITIAL.
        ev_message = |Written as an inactive version, but DWINACTIV has no CUAD entry for { iv_program } to activate|.
        EXIT.
      ENDIF.
      lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
      CALL FUNCTION 'RS_WORKING_OBJECTS_ACTIVATE'
        EXPORTING
          activate_ddic_objects  = space
          with_popup             = space
          suppress_corr_insert   = 'X'
          ui_decoupled           = abap_true
        TABLES
          objects                = lt_objects
        EXCEPTIONS
          OTHERS                 = 1.
      lv_rc = sy-subrc.
      IF lv_rc <> 0 AND sy-msgid IS NOT INITIAL
         AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      COMMIT WORK AND WAIT.
      SELECT SINGLE uname FROM dwinactiv WHERE object = 'CUAD' AND obj_name = @iv_program INTO @lv_inact_user.
      IF sy-subrc = 0.
        ev_message = |Written, but NOT activated (RS_WORKING_OBJECTS_ACTIVATE { lv_rc } { lv_msg }); | &&
                     |the change is the inactive version of { iv_program } - activate it in SE41|.
        EXIT.
      ENDIF.
    ENDIF.

    CLEAR: lt_sta, lt_fun, lt_men, lt_mtx, lt_act, lt_but, lt_pfk, lt_set, lt_doc, lt_tit, lt_biv.
    CALL FUNCTION 'RS_CUA_INTERNAL_FETCH'
      EXPORTING
        program         = iv_program
        language        = lv_masterlang
        state           = 'A'
      TABLES
        sta             = lt_sta
        fun             = lt_fun
        men             = lt_men
        mtx             = lt_mtx
        act             = lt_act
        but             = lt_but
        pfk             = lt_pfk
        set             = lt_set
        doc             = lt_doc
        tit             = lt_tit
        biv             = lt_biv
      EXCEPTIONS
        OTHERS          = 1.
    IF sy-subrc <> 0.
      ev_message = |Written, but the active interface of { iv_program } could not be read back|.
      EXIT.
    ENDIF.`;

const EDIT_FREE = `  IF lv_locked = abap_true.
    CALL FUNCTION 'RS_ACCESS_PERMISSION'
      EXPORTING
        mode         = 'FREE'
        object       = iv_program
        object_class = 'SCUA'
      EXCEPTIONS
        OTHERS       = 1.
  ENDIF.`;

const EDIT_HEADER = (
  what: string,
) => `* Installed by the mcp-abap-adt tool SetupGuiStatusHelper - do not edit here,
* the tool overwrites this source. Helper version ${CUA_HELPER_VERSION}.
*
* ${what}
* Every refusal runs BEFORE RS_CORR_INSERT / RS_CUA_INTERNAL_WRITE;
* iv_test = 'X' stops after them.
* ev_status: S = written and read back, F = refused or failed.
* ev_written: X = RS_CUA_INTERNAL_WRITE ran and was committed.`;

/**
 * Delete ONE GUI status, as SE41 does (LSMPEF00 del_status_internal): the
 * status row and its active-function rows. Its key set, toolbar and menu bar
 * stay in the interface (SE41 removes those only with "delete unused
 * objects"); the ones no other status uses are reported in ev_warning.
 */
export const CUA_HELPER_DELETE_STATUS_SOURCE = `FUNCTION z_mcp_cua_delete_status
  IMPORTING
    VALUE(iv_program) TYPE progname
    VALUE(iv_status) TYPE gui_status
    VALUE(iv_request) TYPE trkorr OPTIONAL
    VALUE(iv_test) TYPE flag DEFAULT space
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_status) TYPE flag
    VALUE(ev_written) TYPE flag
    VALUE(ev_message) TYPE string
    VALUE(ev_warning) TYPE string
    VALUE(ev_language) TYPE spras
    VALUE(ev_write_state) TYPE char1
    VALUE(ev_korrnum) TYPE trkorr.

${EDIT_HEADER('Deletes ONE GUI status (STA row + its SET rows), as SE41 does.')}

${EDIT_DECLARATIONS}
  DATA lv_unused TYPE string.
  DATA lv_set_count TYPE i.

  ev_version = '${CUA_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_written, ev_message, ev_warning, ev_write_state, ev_korrnum.

${EDIT_PRELUDE}

  DO 1 TIMES.
${EDIT_FETCH}

    " Objects of the status that no OTHER status uses stay behind unused, as in SE41.
    IF ls_sta-pfkcode IS NOT INITIAL.
      LOOP AT lt_sta INTO DATA(ls_other) WHERE code <> iv_status AND pfkcode = ls_sta-pfkcode.
        lv_shared = |{ lv_shared } { ls_other-code }|.
        IF ls_other-butcode = ls_sta-butcode.
          lv_rc = 1.
        ENDIF.
      ENDLOOP.
      IF lv_shared IS INITIAL.
        lv_unused = |function key set { ls_sta-pfkcode }|.
      ELSEIF lv_rc = 0 AND ls_sta-butcode IS NOT INITIAL.
        lv_unused = |toolbar { ls_sta-butcode } of key set { ls_sta-pfkcode }|.
      ENDIF.
    ENDIF.
    IF ls_sta-actcode IS NOT INITIAL.
      LOOP AT lt_sta TRANSPORTING NO FIELDS WHERE code <> iv_status AND actcode = ls_sta-actcode.
        EXIT.
      ENDLOOP.
      IF sy-subrc <> 0.
        lv_unused = |{ lv_unused }{ COND string( WHEN lv_unused IS NOT INITIAL THEN \`, \` ) }menu bar { ls_sta-actcode }|.
      ENDIF.
    ENDIF.
    IF lv_unused IS NOT INITIAL.
      ev_warning = |No other status uses { lv_unused }: left in the interface unused, as SE41 leaves them | &&
                   |(SE41: Utilities > Delete unused objects)|.
    ENDIF.
    LOOP AT lt_set TRANSPORTING NO FIELDS WHERE status = iv_status.
      lv_set_count = lv_set_count + 1.
    ENDLOOP.

    IF iv_test = 'X'.
      ev_status = 'S'.
      ev_message = |TEST MODE: every check passed, nothing was written (status { iv_status }, { lv_set_count } active functions)|.
      EXIT.
    ENDIF.

    DELETE lt_sta WHERE code = iv_status.
    DELETE lt_set WHERE status = iv_status.

${EDIT_SAVE}
    IF line_exists( lt_sta[ code = iv_status ] ) OR line_exists( lt_set[ status = iv_status ] ).
      ev_message = |Written, but status { iv_status } is still in the active interface of { iv_program }|.
      EXIT.
    ENDIF.

    ev_status = 'S'.
    ev_message = |Status { iv_status } deleted from { iv_program }|.
  ENDDO.

${EDIT_FREE}

ENDFUNCTION.`;

/**
 * Remove ONE function's button from the application toolbar of ONE status —
 * the inverse of Z_MCP_CUA_ADD_BUTTON. As SE41 (LSMPEF01 del_ref_but /
 * renum_but_entry): the toolbar entry goes and the entries after it move one
 * slot left. Unless iv_keep_key, the function's key binding in the status's
 * key set goes too; a function then referenced by no key set and no menu is
 * removed from the interface with its active-function rows (SE41
 * del_ref_entries_fun does the same once the function is gone).
 */
export const CUA_HELPER_REMOVE_BUTTON_SOURCE = `FUNCTION z_mcp_cua_remove_button
  IMPORTING
    VALUE(iv_program) TYPE progname
    VALUE(iv_status) TYPE gui_status
    VALUE(iv_function) TYPE gui_func
    VALUE(iv_keep_key) TYPE flag DEFAULT space
    VALUE(iv_request) TYPE trkorr OPTIONAL
    VALUE(iv_test) TYPE flag DEFAULT space
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_status) TYPE flag
    VALUE(ev_written) TYPE flag
    VALUE(ev_message) TYPE string
    VALUE(ev_warning) TYPE string
    VALUE(ev_language) TYPE spras
    VALUE(ev_slots) TYPE string
    VALUE(ev_fkeys) TYPE string
    VALUE(ev_function_deleted) TYPE flag
    VALUE(ev_write_state) TYPE char1
    VALUE(ev_korrnum) TYPE trkorr.

${EDIT_HEADER('Removes ONE function from the application toolbar of ONE status (see the TS file).')}

${EDIT_DECLARATIONS}
  DATA lt_pfnos TYPE STANDARD TABLE OF cua_pfno WITH EMPTY KEY.
  TYPES: BEGIN OF ty_remove,
           code TYPE rsmpe_but-code,
           no   TYPE i,
         END OF ty_remove.
  DATA lt_remove TYPE STANDARD TABLE OF ty_remove WITH EMPTY KEY.
  DATA lv_toolbar TYPE string.
  DATA lv_no TYPE i.

  ev_version = '${CUA_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_written, ev_message, ev_warning, ev_slots, ev_fkeys, ev_function_deleted, ev_write_state, ev_korrnum.

${EDIT_PRELUDE}

  DO 1 TIMES.
${EDIT_FETCH}
    IF ls_sta-modal = 'C'.
      ev_message = |Status { iv_status } is a context menu: it has no application toolbar|.
      EXIT.
    ENDIF.
    IF ls_sta-pfkcode IS INITIAL OR ls_sta-butcode IS INITIAL.
      ev_message = |Status { iv_status } has no function key set / application toolbar of its own|.
      EXIT.
    ENDIF.
    LOOP AT lt_sta INTO DATA(ls_other) WHERE code <> iv_status AND pfkcode = ls_sta-pfkcode.
      lv_shared = |{ lv_shared } { ls_other-code }|.
    ENDLOOP.
    IF lv_shared IS NOT INITIAL.
      ev_message = |Status { iv_status } shares its function key set { ls_sta-pfkcode } with status(es){ lv_shared }: | &&
                   |removing the button would change them too - refused (copy it to a new status first: CopyGuiStatus)|.
      EXIT.
    ENDIF.

    " The keys of the function in this key set, and the toolbar slots showing them.
    LOOP AT lt_pfk INTO DATA(ls_pfk) WHERE code = ls_sta-pfkcode AND funcode = iv_function.
      APPEND ls_pfk-pfno TO lt_pfnos.
    ENDLOOP.
    LOOP AT lt_but INTO DATA(ls_but) WHERE pfk_code = ls_sta-pfkcode AND code = ls_sta-butcode.
      IF line_exists( lt_pfnos[ table_line = ls_but-pfno ] ).
        ev_slots = |{ ev_slots } { ls_but-no }|.
      ELSEIF ls_but-pfno <> 'S'.
        READ TABLE lt_pfk INTO DATA(ls_shown) WITH KEY code = ls_sta-pfkcode pfno = ls_but-pfno.
        lv_toolbar = |{ lv_toolbar } { ls_shown-funcode }|.
      ENDIF.
    ENDLOOP.
    IF ev_slots IS INITIAL.
      ev_message = |Function { iv_function } is not on the application toolbar of status { iv_status } (toolbar:{ lv_toolbar })|.
      EXIT.
    ENDIF.
    LOOP AT lt_pfnos INTO DATA(lv_pfno).
      ev_fkeys = |{ ev_fkeys } { lv_pfno }|.
    ENDLOOP.
    CONDENSE: ev_slots, ev_fkeys.

    IF iv_test = 'X'.
      ev_status = 'S'.
      ev_message = |TEST MODE: every check passed, nothing was written (slot(s) { ev_slots }, key(s) { ev_fkeys })|.
      EXIT.
    ENDIF.

    " Toolbar entries to remove: this status's toolbar; when the keys go too, every
    " toolbar of the key set that shows them (SE41 del_ref_but).
    LOOP AT lt_but INTO ls_but WHERE pfk_code = ls_sta-pfkcode.
      IF line_exists( lt_pfnos[ table_line = ls_but-pfno ] ) AND ( ls_but-code = ls_sta-butcode OR iv_keep_key <> 'X' ).
        lv_no = ls_but-no.
        APPEND VALUE #( code = ls_but-code no = lv_no ) TO lt_remove.
      ENDIF.
    ENDLOOP.
    " Highest slot first; every later entry of the same toolbar moves one slot left (SE41 renum_but_entry).
    SORT lt_remove BY code no DESCENDING.
    LOOP AT lt_remove INTO DATA(ls_remove).
      LOOP AT lt_but ASSIGNING FIELD-SYMBOL(<ls_but>) WHERE pfk_code = ls_sta-pfkcode AND code = ls_remove-code.
        lv_no = <ls_but>-no.
        IF lv_no = ls_remove-no.
          DELETE lt_but INDEX sy-tabix.
        ELSEIF lv_no > ls_remove-no.
          lv_no = lv_no - 1.
          <ls_but>-no = |{ lv_no WIDTH = 2 ALIGN = RIGHT PAD = '0' }|.
        ENDIF.
      ENDLOOP.
    ENDLOOP.
    IF iv_keep_key <> 'X'.
      DELETE lt_pfk WHERE code = ls_sta-pfkcode AND funcode = iv_function.
    ENDIF.
    " A function no key set and no menu refers to any more is gone from the interface.
    IF NOT line_exists( lt_pfk[ funcode = iv_function ] ) AND NOT line_exists( lt_men[ ref_type = 'F' ref_code = iv_function ] ).
      DELETE lt_fun WHERE code = iv_function.
      DELETE lt_set WHERE function = iv_function.
      ev_function_deleted = 'X'.
    ELSE.
      ev_warning = |Function { iv_function } is still used elsewhere in the interface (a function key or a menu) | &&
                   |and stays defined|.
    ENDIF.
    SORT: lt_but, lt_pfk.

${EDIT_SAVE}
    LOOP AT lt_but INTO ls_but WHERE pfk_code = ls_sta-pfkcode AND code = ls_sta-butcode.
      IF line_exists( lt_pfnos[ table_line = ls_but-pfno ] ).
        ev_message = |Written, but function { iv_function } is still on the toolbar of { iv_status } (slot { ls_but-no })|.
        EXIT.
      ENDIF.
    ENDLOOP.
    IF ev_message IS NOT INITIAL.
      EXIT.
    ENDIF.
    IF iv_keep_key <> 'X' AND line_exists( lt_pfk[ code = ls_sta-pfkcode funcode = iv_function ] ).
      ev_message = |Written, but function { iv_function } is still bound to a key of status { iv_status }|.
      EXIT.
    ENDIF.
    IF ev_function_deleted = 'X' AND line_exists( lt_fun[ code = iv_function ] ).
      ev_message = |Written, but function { iv_function } is still defined in { iv_program }|.
      EXIT.
    ENDIF.

    ev_status = 'S'.
    ev_message = |Button { iv_function } removed from status { iv_status } of { iv_program } (slot(s) { ev_slots })|.
  ENDDO.

${EDIT_FREE}

ENDFUNCTION.`;
