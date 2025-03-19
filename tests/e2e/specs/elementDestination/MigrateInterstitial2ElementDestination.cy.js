import {
  assertDownloadedXmlContainsExpected,
  uploadXml,
} from '../../support/utils';

describe('Test the migration of interstitial to element destination', () => {

  it('load a old process with interstitial enabled and migrate it to the new element destination format', () => {
    uploadXml('taskWithInterstitial.xml');

    assertDownloadedXmlContainsExpected(`
      <bpmn:task id="node_3" name="Form Task" pm:screenRef="685" pm:allowInterstitial="true" pm:interstitialScreenRef="804" pm:assignment="requester" pm:assignmentLock="false" pm:allowReassignment="false" pm:config="{&#34;web_entry&#34;:null,&#34;email_notifications&#34;:{&#34;notifications&#34;:[]}}" pm:elementDestination="{&#34;type&#34;:&#34;displayNextAssignedTask&#34;}">
    `);
    assertDownloadedXmlContainsExpected(`
      <bpmn:task id="node_85" name="Form Task" pm:screenRef="685" pm:allowInterstitial="true" pm:interstitialScreenRef="804" pm:assignment="requester" pm:assignmentLock="false" pm:allowReassignment="false" pm:config="{&#34;web_entry&#34;:null,&#34;email_notifications&#34;:{&#34;notifications&#34;:[]}}" pm:elementDestination="{&#34;type&#34;:&#34;displayNextAssignedTask&#34;}">
    `);
    assertDownloadedXmlContainsExpected(`
      <bpmn:task id="node_105" name="Form Task" pm:screenRef="685" pm:allowInterstitial="false" pm:interstitialScreenRef="804" pm:assignment="requester" pm:assignmentLock="false" pm:allowReassignment="false" pm:config="{&#34;web_entry&#34;:null,&#34;email_notifications&#34;:{&#34;notifications&#34;:[]}}" pm:elementDestination="{&#34;type&#34;:&#34;taskSource&#34;,&#34;value&#34;:null}">
    `);

  });

});
