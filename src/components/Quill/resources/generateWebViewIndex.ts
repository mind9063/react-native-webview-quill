import { QuillOptionsStatic } from 'quill';
import { DeltaStatic } from 'quill-delta';
import { EventType } from '../interfaces/IMessage';
import { IResources } from '../interfaces/IResources';

/* This file contains HTML for the webview that contains Quill. You can use the es6-string-html, es6-string-css and
   es6-string-javascript plugins for VSCode to get syntax highlighting on this file.

   We input all EventType.{...} occurrences as variables in the template strings to enable type analysis for the event
   types, since they might be change sensitive. */

export function generateWebViewIndex(
  resources: IResources,
  content: DeltaStatic | undefined,
  options: QuillOptionsStatic
) {
  return encodeURIComponent(/*html*/ `
    <!DOCTYPE html>
    <html>
      <head>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/katex.min.css" integrity="sha384-BdGj8xC2eZkQaxoQ8nSLefg4AV4/AwB3Fj+8SUSo7pnKP6Eoy18liIKTPn9oBYNG" crossorigin="anonymous">
        <script src="https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/katex.min.js" integrity="sha384-JiKN5O8x9Hhs/UE5cT5AAJqieYlOZbGT3CHws/y97o3ty4R7/O5poG9F3JoiOYw1" crossorigin="anonymous"></script>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
        <style>
          html,
          body {
            height: 100%;
            margin: 0;
            padding: 0;
          }

          .quill-wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
          }

          .quill-editor {
            flex: 1 1 auto;
          }

          .quill-wrapper .ql-container {
            height: auto;
            font-size: 16px;
          }

          .quill-wrapper .ql-editor {
            padding: 11px; 
            transition: all 0.2s;
          }

          .quill-wrapper .ql-container.ql-snow,
          .quill-wrapper .ql-toolbar.ql-snow + .ql-container.ql-snow {
            border: 2px solid rgba(0,0,0,0.12);
            border-radius: 4px;
            transition: all 0.2s;
          }

          .quill-wrapper .ql-container.ql-snow.quill-focus,
          .quill-wrapper .ql-toolbar.ql-snow + .ql-container.ql-snow.quill-focus {
            border-color: #00b050;
          }

          .quill-wrapper .ql-toolbar.ql-snow {
            border: 0;
            padding-left: 0px;
          }

          .quill-wrapper .ql-editor.ql-blank::before {
            font-style: normal;
            left: 11px;
            color: rgba(0,0,0,0.54);
            transition: all 0.2s;
          }
        </style>

        <style>
          ${resources.styleSheet}
        </style>
      </head>
      <body>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.11.0/dist/contrib/mathtex-script-type.min.js" integrity="sha384-LJ2FmexL77rmGm6SIpxq7y+XA6bkLzGZEgCywzKOZG/ws4va9fUVu2neMjvc3zdv"></script>
        <div id="editor" class="quill-editor"></div>
        <div class="quill-wrapper">
          <div class="quill-editor"></div>
        </div>

        <script>
          ${resources.script};
        </script>

        <script>
          function sendMessage(type, data) {
            const message = JSON.stringify({ type, data });

            // window.ReactNativeWebView is used by the react-native-community/react-native-webview package
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(message);
            } else {
              window.postMessage(message);
            }
          }

          function onContentChange(data) {
            editor.setContents(data);
          }

          function processMessage(message) {
            const { type, data } = message;

            switch (type) {
              case ${EventType.CONTENT_CHANGE}:
                return onContentChange(data);
            }
          }

          function onMessage(event) {
            try {
              // TODO: Implement only sending delta's to save time on JSON parsing overhead
              processMessage(JSON.parse(event.data));
            } catch (error) {
              console.warn('Ignoring unprocessable event from React Native to Quill WebView due to error: ', error);
            }
          }

          function bindMessageHandler() {
            window.addEventListener('message', onMessage);
            window.onmessage = onMessage
          }

          function onFocus(editor) {
            editor.container.classList.add('quill-focus');
          }

          function onBlur(editor) {
            editor.container.classList.remove('quill-focus');
          }

          /* Create the Quill editor */
          const editor = new Quill('.quill-editor', ${JSON.stringify(options)});

          /* Set the initial content */
          editor.setContents(${JSON.stringify(content)})

          /* Send a message when the text changes */
          editor.on('text-change', function() {
            sendMessage(${EventType.CONTENT_CHANGE}, editor.getContents());
          });

          editor.root.addEventListener('focus', () => onFocus(editor));
          editor.root.addEventListener('blur', () => onBlur(editor));

          bindMessageHandler();
        </script>
      </body>
    </html>
  `);
}
