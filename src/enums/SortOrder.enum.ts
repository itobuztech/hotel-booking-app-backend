import { registerEnumType } from '@nestjs/graphql';

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

export default SortOrder;
