-- Preserve the existing pricing function and remove only the roomstay-count restriction.
do $$
declare definition text; restriction text := ' or (not (''MAIN''=any(ids)) and cardinality(ids)<>1)';
begin
  definition := pg_get_functiondef('private.quote_request(jsonb)'::regprocedure);
  if position(restriction in definition) = 0 then
    raise exception 'Expected resource validation not found; review quote_request before migrating';
  end if;
  execute replace(definition, restriction, '');
end $$;
