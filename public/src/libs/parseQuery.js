export default parseQuery;

function parseQuery() {
    const search = (location.search || '').substr(1);

    if (!search) return null;

    const queries = {};
    const params = search.split('&');

    params.map(param => {
        param = param.split('=');
        queries[param[0]] = param[1];
    });

    return queries;
}