import React, { FC } from 'react';
import {
  Table,
  Tbody,
  Tr,
  Td,
  Text,
} from '@chakra-ui/react'
import FileMetadata from '../interfaces/FileMetadata';
import { getBytes } from '../helpers/fileHelper';

const dateFormat = (timestamp: number) => timestamp === 0 ? 'N/A' : new Date(timestamp).toLocaleDateString()

const AssetMetadata: FC<{ assetMetadata?: FileMetadata }> = ({ assetMetadata }) => {
  return (
    <>
      <Table variant="simple">
        <Tbody>
          <Tr>
            <Td paddingInlineStart={0}>Asset Name</Td>
            <Td textAlign="end" paddingInlineEnd={0}>
              <Text maxW={230} float={'right'}>
                {assetMetadata?.name}
              </Text>
            </Td>
          </Tr>
          <Tr>
            <Td paddingInlineStart={0}>Size</Td>
            <Td textAlign="end" paddingInlineEnd={0}>{assetMetadata?.size && getBytes(assetMetadata.size)}</Td>
          </Tr>
          <Tr>
            <Td paddingInlineStart={0}>Last Modified</Td>
            <Td textAlign="end" paddingInlineEnd={0}>{assetMetadata?.lastModified && dateFormat(assetMetadata.lastModified)}</Td>
          </Tr>
          <Tr>
            <Td paddingInlineStart={0}>Type</Td>
            <Td textAlign="end" paddingInlineEnd={0}>{assetMetadata?.type}</Td>
          </Tr>
        </Tbody>
      </Table>
    </>
  );
}

export default AssetMetadata;
