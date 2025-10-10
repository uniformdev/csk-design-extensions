import { type CreateAIEditHookFn } from '@uniformdev/mesh-edgehancer-sdk';
import { fetchThemeData } from './helpers';
import { getParameterHandler, ParameterConfig } from './parameterHandlers';

/**
 * This is an example of a createAIEdit hook.
 *
 * CreateAIEdit hooks are passed an AI edit request, and are responsible for returning:
 * - The expected output schema of the AI edit request (zod). Normally this is the shape of the value of your parameter type, however in concert with a afterAIEdit hook, you can use a different interstitial type and use the after hook to transform it to your parameter type.
 * - LLM editing instructions for your parameter type
 *
 * NOTE: we do not currently support defining tools for the edit request to utilize conditionally, so any dynamic data must be handed in the edit instructions/schema.
 *
 * NOTE: thrown exceptions in this hook will have their message sent to the LLM as the error message, and it will return a failed edit with a cleaned up error message.
 * If you run code that may throw an exception where you want to hide the message, use a try/catch block and re-throw a custom error.
 */
const createAIEdit: CreateAIEditHookFn = async ({ editRequest, projectId }) => {
  const getThemeData = async () => await fetchThemeData(projectId);
  const { type: parameterType } = editRequest.propertyDefinition;

  const config: ParameterConfig = {
    ...(editRequest.propertyDefinition.typeConfig as MeshType.MeshDesignExtensionsParametersConfig),
  };

  const handler = getParameterHandler(parameterType);
  return await handler(config, getThemeData);
};

export default createAIEdit;
