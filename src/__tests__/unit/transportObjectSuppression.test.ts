/**
 * `include_objects: false` has to strip the objects nested under the TASKS too
 * (round 3, R3-D2).
 *
 * A request's objects arrive twice — once flat under the request, once inside
 * each task — and `include_tasks` defaults to true. Reading the flag only at the
 * top level meant a caller who asked for "no objects" still received every
 * object in the request: 68 KB / 2467 lines for a request whose object-free
 * answer is ~20 lines, which exceeded a caller's token cap.
 */

import { parseTransportXml } from '../../handlers/transport/readonly/handleGetTransport';

const XML = `<?xml version="1.0" encoding="utf-8"?>
<tm:root xmlns:tm="http://www.sap.com/cts/adt/tm" xmlns:adtcore="http://www.sap.com/adt/core"
         adtcore:name="AAAK900001">
  <tm:request tm:number="AAAK900001" tm:desc="Round 3" tm:status="D" tm:owner="SOME.USER">
    <tm:all_objects>
      <tm:abap_object tm:name="ZMY_TABLE" tm:type="TABL" tm:obj_desc="A table"/>
      <tm:abap_object tm:name="ZMY_CLASS" tm:type="CLAS" tm:obj_desc="A class"/>
    </tm:all_objects>
    <tm:task tm:number="AAAK900002" tm:parent="AAAK900001" tm:desc="Task" tm:status="D">
      <tm:abap_object tm:name="ZMY_TABLE" tm:type="TABL" tm:obj_desc="A table"/>
      <tm:abap_object tm:name="ZMY_CLASS" tm:type="CLAS" tm:obj_desc="A class"/>
      <tm:abap_object tm:name="ZMY_VIEW" tm:type="DDLS" tm:obj_desc="A view"/>
    </tm:task>
  </tm:request>
</tm:root>`;

describe('GetTransport object suppression', () => {
  it('returns objects in both places by default', () => {
    const parsed = parseTransportXml(XML, true, true);
    expect(parsed.objects).toHaveLength(2);
    expect(parsed.tasks[0].objects).toHaveLength(3);
    expect(parsed.object_count).toBe(2);
  });

  it('include_objects:false strips the objects nested under the tasks as well', () => {
    const parsed = parseTransportXml(XML, false, true);
    expect(parsed.objects).toBeUndefined();
    // THE DEFECT: this used to be the full 3-object list, so "no objects" still
    // returned every object in the request.
    expect(parsed.tasks).toHaveLength(1);
    expect(parsed.tasks[0].objects).toEqual([]);
    expect(parsed.object_count).toBe(0);
  });

  it('the task entry itself survives — only its objects are dropped', () => {
    const parsed = parseTransportXml(XML, false, true);
    expect(parsed.tasks[0].number).toBe('AAAK900002');
    expect(parsed.task_count).toBe(1);
  });

  it('both flags false leaves only the request header', () => {
    const parsed = parseTransportXml(XML, false, false);
    expect(parsed.objects).toBeUndefined();
    expect(parsed.tasks).toBeUndefined();
    expect(parsed.object_count).toBe(0);
    expect(parsed.task_count).toBe(0);
    expect(parsed.transport.number).toBe('AAAK900001');
  });
});
