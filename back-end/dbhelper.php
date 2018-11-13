<?php

function checkId($db, $table_name, $id_field, $id)
{
	$query = "select * from $table_name where $id_field=$id";
	//echo $query;
	$result = $db->query($query);
	if($result->num_rows > 0)
		return TRUE;
	else
		return FALSE;
}

function getFrequencyById($db, $id){

	$query = "select * from subfrequency where SubFrequencyId=$id";
	$result = $db->query($query);
	if($result->num_rows > 0)
		return $result->fetch_assoc()["SubFrequencyDesc"];
	else
		return FALSE;
}

function addArguments($db, &$object)
{
	$id = (int)$object["RequestId"];
	$resArray = array();
	$query = "select * from apirequestargs where RequestId=$id";
	$result = $db->query($query);

	while ($row = $result->fetch_assoc()) {
		
		$resArray[$row["ArgumentKey"]] = $row["ArgumentValue"];
	}
	$object["RequestArguments"] = $resArray;

}



?>
