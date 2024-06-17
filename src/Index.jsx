import React, { useState } from 'react';
import Papa from 'papaparse';
import { useTable, usePagination } from 'react-table';
import { FaPlus, FaTrash, FaDownload } from 'react-icons/fa';

const EditableTable = ({ columns, data, updateMyData, removeRow, addRow }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      updateMyData,
      initialState: { pageIndex: 0 },
    },
    usePagination
  );

  return (
    <>
      <table {...getTableProps()} className="table-auto w-full">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()} className="px-4 py-2">{column.render('Header')}</th>
              ))}
              <th className="px-4 py-2">Actions</th>
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()} className="border px-4 py-2">
                      <input
                        value={cell.value}
                        onChange={e => updateMyData(row.index, cell.column.id, e.target.value)}
                        className="w-full"
                      />
                    </td>
                  );
                })}
                <td className="border px-4 py-2">
                  <button onClick={() => removeRow(row.index)} className="text-red-500">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <span>
          | Go to page:{' '}
          <input
            type="number"
            defaultValue={pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <button onClick={addRow} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        <FaPlus /> Add Row
      </button>
    </>
  );
};

const Index = () => {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleFileUpload = event => {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: results => {
        setData(results.data);
        setColumns(
          Object.keys(results.data[0]).map(key => ({
            Header: key,
            accessor: key,
          }))
        );
      },
    });
  };

  const updateMyData = (rowIndex, columnId, value) => {
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  const removeRow = rowIndex => {
    setData(old => old.filter((row, index) => index !== rowIndex));
  };

  const addRow = () => {
    setData(old => [...old, {}]);
  };

  const downloadCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'edited_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">CSV Upload, Edit, and Download Tool</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
      {data.length > 0 && (
        <>
          <EditableTable
            columns={columns}
            data={data}
            updateMyData={updateMyData}
            removeRow={removeRow}
            addRow={addRow}
          />
          <button onClick={downloadCSV} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
            <FaDownload /> Download CSV
          </button>
        </>
      )}
    </div>
  );
};

export default Index;