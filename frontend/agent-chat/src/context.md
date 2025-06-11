declare const RunAgentInputSchema: z.ZodObject<{
    threadId: z.ZodString;
    runId: z.ZodString;
    state: z.ZodAny;
    messages: z.ZodArray<z.ZodDiscriminatedUnion<"role", [z.ZodObject<z.objectUtil.extendShape<{
        id: z.ZodString;
        role: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
    }, {
        role: z.ZodLiteral<"developer">;
        content: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
        id: string;
        role: "developer";
        content: string;
        name?: string | undefined;
    }, {
        id: string;
        role: "developer";
        content: string;
        name?: string | undefined;
    }>, z.ZodObject<z.objectUtil.extendShape<{
        id: z.ZodString;
        role: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
    }, {
        role: z.ZodLiteral<"system">;
        content: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
        id: string;
        role: "system";
        content: string;
        name?: string | undefined;
    }, {
        id: string;
        role: "system";
        content: string;
        name?: string | undefined;
    }>, z.ZodObject<z.objectUtil.extendShape<{
        id: z.ZodString;
        role: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
    }, {
        role: z.ZodLiteral<"assistant">;
        content: z.ZodOptional<z.ZodString>;
        toolCalls: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodLiteral<"function">;
            function: z.ZodObject<{
                name: z.ZodString;
                arguments: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                name: string;
                arguments: string;
            }, {
                name: string;
                arguments: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            function: {
                name: string;
                arguments: string;
            };
            type: "function";
            id: string;
        }, {
            function: {
                name: string;
                arguments: string;
            };
            type: "function";
            id: string;
        }>, "many">>;
    }>, "strip", z.ZodTypeAny, {
        id: string;
        role: "assistant";
        name?: string | undefined;
        content?: string | undefined;
        toolCalls?: {
            function: {
                name: string;
                arguments: string;
            };
            type: "function";
            id: string;
        }[] | undefined;
    }, {
        id: string;
        role: "assistant";
        name?: string | undefined;
        content?: string | undefined;
        toolCalls?: {
            function: {
                name: string;
                arguments: string;
            };
            type: "function";
            id: string;
        }[] | undefined;
    }>, z.ZodObject<z.objectUtil.extendShape<{
        id: z.ZodString;
        role: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
    }, {
        role: z.ZodLiteral<"user">;
        content: z.ZodString;
    }>, "strip", z.ZodTypeAny, {
        id: string;
        role: "user";
        content: string;
        name?: string | undefined;
    }, {
        id: string;
        role: "user";
        content: string;
        name?: string | undefined;
    }>, z.ZodObject<{
        id: z.ZodString;
        content: z.ZodString;
        role: z.ZodLiteral<"tool">;
        toolCallId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        role: "tool";
        content: string;
        toolCallId: string;
    }, {
        id: string;
        role: "tool";
        content: string;
        toolCallId: string;
    }>]>, "many">;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        parameters?: any;
    }, {
        name: string;
        description: string;
        parameters?: any;
    }>, "many">;
    context: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        description: string;
    }, {
        value: string;
        description: string;
    }>, "many">;
    forwardedProps: z.ZodAny;
}, "strip", z.ZodTypeAny, {
 