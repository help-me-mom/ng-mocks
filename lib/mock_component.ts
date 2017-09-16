import 'reflect-metadata';

export function MockComponent(component: any) {
  const annotations = Reflect.getMetadata('annotations', component);
  const propertyMetadata = Reflect.getMetadata('propMetadata', component);
  console.log(Reflect.metadata('design:type', component));
  console.log(Reflect.getMetadataKeys(component));
  console.log('**************');

  // const decorator = annotations.find((annotation) => annotation instanceof DecoratorFactory);
  console.log(annotations[0].selector);

  for (var property in propertyMetadata) {
    console.log(property);
    console.log(Reflect.getMetadata('annotations', component));
    console.log(Reflect.getOwnMetadata('annotations', component, property));
  }
  console.log(Reflect.getOwnMetadataKeys(component));
  console.log(Reflect.getOwnMetadata('annotations', component));
  console.log(Reflect.getOwnMetadata('propMetadata', component));

  // console.log(Reflect.getMetadata('annotations', component));
  // console.log(Reflect.getMetadata('propMetadata', component));
  console.log(Reflect.getMetadata('propMetadata', component)['someInput'][0]);
}
