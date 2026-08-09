<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260808233208 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE trip_project ADD selected_destination_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE trip_project ADD CONSTRAINT FK_195F9543B10B97CE FOREIGN KEY (selected_destination_id) REFERENCES destination_proposal (id) ON DELETE SET NULL NOT DEFERRABLE');
        $this->addSql('CREATE INDEX IDX_195F9543B10B97CE ON trip_project (selected_destination_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE trip_project DROP CONSTRAINT FK_195F9543B10B97CE');
        $this->addSql('DROP INDEX IDX_195F9543B10B97CE');
        $this->addSql('ALTER TABLE trip_project DROP selected_destination_id');
    }
}
