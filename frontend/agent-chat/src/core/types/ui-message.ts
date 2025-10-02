import type { ToolInvocationState } from "./agent";

type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
type JSONObject = {
    [key: string]: JSONValue;
};
type JSONArray = JSONValue[];


type LanguageModelV1ProviderMetadata = Record<string, Record<string, JSONValue>>;

/**
 * A source that has been used as input to generate the response.
 */
type LanguageModelV1Source = {
    /**
     * A URL source. This is return by web search RAG models.
     */
    sourceType: 'url';
    /**
     * The ID of the source.
     */
    id: string;
    /**
     * The URL of the source.
     */
    url: string;
    /**
     * The title of the source.
     */
    title?: string;
    /**
     * Additional provider metadata for the source.
     */
    providerMetadata?: LanguageModelV1ProviderMetadata;
};


export interface ToolInvocation<ARGS = any, RESULT = any> {
    state: ToolInvocationState;
    toolCallId: string;
    toolName: string;
    args: ARGS;
    result?: RESULT;
}


/**
 * AI SDK UI Messages. They are used in the client and to communicate between the frontend and the API routes.
 */
export interface UIMessage {
    id: string;
    role: 'system' | 'user' | 'assistant' | 'data';
    parts: Array<TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart | FileUIPart | StepStartUIPart>;
}

/**
 * A text part of a message.
 */
export type TextUIPart = {
    type: 'text';
    /**
     * The text content.
     */
    text: string;
};
/**
 * A reasoning part of a message.
 */
export type ReasoningUIPart = {
    type: 'reasoning';
    /**
     * The reasoning text.
     */
    reasoning: string;
    details: Array<{
        type: 'text';
        text: string;
        signature?: string;
    } | {
        type: 'redacted';
        data: string;
    }>;
};
/**
 * A tool invocation part of a message.
 */
export type ToolInvocationUIPart = {
    type: 'tool-invocation';
    /**
     * The tool invocation.
     */
    toolInvocation: ToolInvocation;
};
/**
 * A source part of a message.
 */
export type SourceUIPart = {
    type: 'source';
    /**
     * The source.
     */
    source: LanguageModelV1Source;
};
/**
 * A file part of a message.
 */
export type FileUIPart = {
    type: 'file';
    mimeType: string;
    data: string;
};
/**
 * A step boundary part of a message.
 */
export type StepStartUIPart = {
    type: 'step-start';
};