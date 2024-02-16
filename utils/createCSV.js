const createCSV = (data) => {

	const csvRows = [];
	const headers = Object.keys(data[0]);
	csvRows.push(headers.join(";"));

	for (const row of data) {
		const values = Object.values(row);
		if (row.keyword.includes("passions the soap opera")) {
			console.log(values);
		}
		csvRows.push(values.join(";"));
	}

	return csvRows.join("\n");
};

export default createCSV;
