import { type AfterAIEditHookFn } from '@uniformdev/mesh-edgehancer-sdk';
import { fetchThemeData } from './helpers';
import { getParameterHandler, ParameterConfig } from './parameterHandlers';

/**
 * This is an example of an afterAIEdit hook. AfterAIEdit hooks are called after a LLM has generated an edit using a createAIEdit hook.
 *
 * The afterAIEdit hook can be used to fail the edit, or apply transformations or business logic to the edit result.
 *
 * NOTE: thrown exceptions in this hook will have their message shown to users as-is.
 * If you run code that may throw an exception where you want to hide the message, use a try/catch block and re-throw a custom error.
 */
const afterAIEdit: AfterAIEditHookFn = async ({ result, newValue, editRequest, projectId }) => {
  if (!result.success) {
    return result;
  }
  const isRequired = (editRequest.propertyDefinition.typeConfig as MeshType.MeshDesignExtensionsParametersConfig)
    ?.required;
  if (isRequired && !newValue) {
    return {
      success: false,
      summary: `Edit rejected because the value is required.`,
    };
  }

  const getThemeData = async () => await fetchThemeData(projectId);
  const { type: parameterType } = editRequest.propertyDefinition;

  const config: ParameterConfig = {
    ...(editRequest.propertyDefinition.typeConfig as MeshType.MeshDesignExtensionsParametersConfig),
  };

  const handler = getParameterHandler(parameterType);
  const { outputJsonSchema } = await handler(config, getThemeData);

  if (!!newValue && !outputJsonSchema.parse(newValue)) {
    return {
      success: false,
      summary: `Edit rejected because the value does not look like a valid for ${parameterType}. Value: ${JSON.stringify(
        newValue
      )}`,
    };
  }
  return result;
};

export default afterAIEdit;
