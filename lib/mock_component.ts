import 'reflect-metadata';

export function MockComponent(component: any) {
  const annotations = Reflect.getMetadata('annotations', component);
  const propertyMetadata = Reflect.getMetadata('propMetadata', component);
  const inputs = [],
    outputs = [];
  console.log(Reflect.metadata('design:type', component));
  console.log(Reflect.getMetadataKeys(component));
  console.log('**************');

  // const decorator = annotations.find((annotation) => annotation instanceof DecoratorFactory);
  console.log(annotations[0].selector);

  for (var property in propertyMetadata) {
    const prop = propertyMetadata[property];
    console.log(property);
    console.log(Reflect.getMetadata('annotations', component));
    console.log(Reflect.getOwnMetadata('annotations', component, property));
    if (prop[0].toString() === '@Input') {
      inputs.push(property);
    } else if (prop[0].toString() === '@Output') {
      outputs.push(property);
    }
  }
  console.log(Reflect.getOwnMetadataKeys(component));
  console.log(Reflect.getOwnMetadata('annotations', component));
  console.log(Reflect.getOwnMetadata('propMetadata', component));

  // console.log(Reflect.getMetadata('annotations', component));
  // console.log(Reflect.getMetadata('propMetadata', component));
  console.log(Reflect.getMetadata('propMetadata', component)['someInput'][0]);
  console.log('inputs:', inputs);
  console.log('outputs:', outputs);
}
