/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import { EditorView, highlightSpecialChars, keymap, ViewUpdate, placeholder } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';
import { indentOnInput } from '@codemirror/language';
import { history, historyKeymap } from '@codemirror/history';
import { defaultKeymap, insertNewlineAndIndent } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { highlightSelectionMatches } from '@codemirror/search';
import { commentKeymap } from '@codemirror/comment';
import { lintKeymap } from '@codemirror/lint';
import { autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { PromQLExtension } from 'codemirror-promql';
import { baseTheme, promqlHighlighter } from './CMTheme';

const promqlExtension = new PromQLExtension();

interface CMExpressionInputProps {
  url: string;
  readonly?: boolean;
  headers?: { [index: string]: string };
  value?: string;
  onChange?: (expr?: string) => void;
  executeQuery?: (expr?: string) => void;
  validateTrigger?: string[];
}

const ExpressionInput = ({ url, headers, value, onChange, executeQuery, readonly = false, validateTrigger = ['onChange', 'onBlur'] }: CMExpressionInputProps, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const executeQueryCallback = useRef(executeQuery);
  const realValue = useRef<string | undefined>(value || '');
  const defaultHeaders = {
    Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
  };

  useEffect(() => {
    executeQueryCallback.current = executeQuery;
    promqlExtension
      .activateCompletion(true)
      .activateLinter(true)
      .setComplete({
        remote: {
          url,
          fetchFn: (resource, options = {}) => {
            const params = options.body?.toString();
            const search = params ? `?${params}` : '';
            return fetch(resource + search, {
              method: 'Get',
              headers: new Headers(
                headers
                  ? {
                      ...defaultHeaders,
                      ...headers,
                    }
                  : defaultHeaders,
              ),
            });
          },
        },
      });

    // Create or reconfigure the editor.
    const view = viewRef.current;
    if (view === null) {
      // If the editor does not exist yet, create it.
      if (!containerRef.current) {
        throw new Error('expected CodeMirror container element to exist');
      }

      const startState = EditorState.create({
        doc: value,
        extensions: [
          baseTheme,
          highlightSpecialChars(),
          history(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          highlightSelectionMatches(),
          promqlHighlighter,
          EditorView.lineWrapping,
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...commentKeymap, ...completionKeymap, ...lintKeymap]),
          placeholder('Expression (press Shift+Enter for newlines)'),
          promqlExtension.asExtension(),
          EditorView.editable.of(!readonly),
          keymap.of([
            {
              key: 'Escape',
              run: (v: EditorView): boolean => {
                v.contentDOM.blur();
                return false;
              },
            },
          ]),
          Prec.override(
            keymap.of([
              {
                key: 'Enter',
                run: (v: EditorView): boolean => {
                  if (typeof executeQueryCallback.current === 'function') {
                    executeQueryCallback.current(realValue.current);
                  }
                  return true;
                },
              },
              {
                key: 'Shift-Enter',
                run: insertNewlineAndIndent,
              },
            ]),
          ),
          EditorView.updateListener.of((update: ViewUpdate): void => {
            if (typeof onChange === 'function') {
              const val = update.state.doc.toString();
              if (val !== realValue.current) {
                if (!val && !realValue.current) return; // 如果新旧值不相等，但是为空字符串或是 undefined 的话则认为值没有变化
                realValue.current = val;
                if (_.includes(validateTrigger, 'onChange')) {
                  onChange(val);
                }
              }
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: containerRef.current,
      });

      viewRef.current = view;

      if (ref) {
        ref.current = view;
      }

      // TODO: 不知道为什么要设置成自动获取焦点，因为某个地方有多处 promqlInput 这样会导致来回设置焦点
      view.focus();
    }
  }, [onChange, JSON.stringify(headers)]);

  useEffect(() => {
    if (realValue.current !== value) {
      const oldValue = realValue.current;
      realValue.current = value || '';
      const view = viewRef.current;
      if (view === null) {
        return;
      }
      view.dispatch(
        view.state.update({
          changes: { from: 0, to: oldValue?.length || 0, insert: value },
        }),
      );
    }
  }, [value]);

  return (
    <div
      className={classNames({ 'ant-input': true, readonly: readonly, 'promql-input': true })}
      onBlur={() => {
        if (typeof onChange === 'function') {
          if (realValue.current !== value) {
            if (!value && !realValue.current) return; // 如果新旧值不相等，但是为空字符串或是 undefined 的话则认为值没有变化
            onChange(realValue.current);
          }
        }
      }}
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          if (typeof onChange === 'function') {
            if (realValue.current !== value) {
              if (!value && !realValue.current) return; // 如果新旧值不相等，但是为空字符串或是 undefined 的话则认为值没有变化
              onChange(realValue.current);
            }
          }
        }
      }}
    >
      <div className='input-content' ref={containerRef} />
    </div>
  );
};

export default React.forwardRef(ExpressionInput);
